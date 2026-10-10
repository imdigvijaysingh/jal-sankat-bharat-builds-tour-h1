# AWS Integration Plan — Jal Sankat

## What's Already Built

Your code already has AWS integration — it just needs real credentials to activate.

| AWS Service | Endpoint | Purpose |
|---|---|---|
| **Amazon Bedrock** (Claude 3 Haiku) | `POST /api/plan` | Generates AI crisis response plans for municipal engineers |
| **Amazon SNS** | `POST /api/alert` | Sends SMS water alerts to citizens / engineers |

Both endpoints fall back gracefully (no crash) if AWS is not configured. Once credentials are added, they go live automatically.

---

## Step 1 — Create an AWS Account

- Go to [https://aws.amazon.com](https://aws.amazon.com)
- Click **Create an AWS Account**
- The free tier is enough for a hackathon demo

---

## Step 2 — Create an IAM User with Programmatic Access

1. In the AWS Console, search for **IAM** → **Users** → **Create User**
2. Name it something like `jal-sankat-dev`
3. Choose **"Attach policies directly"** and add:
   - `AmazonBedrockFullAccess` — for Claude AI plan generation
   - `AmazonSNSFullAccess` — for SMS alerts
4. After creation → go to the user → **Security credentials** → **Create access key**
5. Choose **"Application running outside AWS"**
6. Copy and save the **Access Key ID** and **Secret Access Key** (shown only once)

---

## Step 3 — Enable Bedrock Model Access

1. In AWS Console, switch to the **`us-east-1` (N. Virginia)** region
2. Search for **Amazon Bedrock** → **Model access** (left sidebar)
3. Click **Manage model access** → tick **Anthropic Claude 3 Haiku** → **Save changes**

> ⚠️ This MUST be done in `us-east-1` — the backend is hardcoded to that region for Bedrock.

---

## Step 4 — Configure the `.env` File

Create `backend/.env` from the example:

```bash
cp backend/.env.example backend/.env
```

Fill in your real credentials:

```env
AWS_ACCESS_KEY_ID=AKIA...your_real_key
AWS_SECRET_ACCESS_KEY=your_real_secret
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
```

> ⚠️ Never commit `.env` to Git — the `.gitignore` already excludes it.

---

## Step 5 — Restart the Backend

```bash
# In backend/ with .venv activated:
uvicorn main:app --reload --port 8000
```

The `/api/plan` and `/api/alert` endpoints will now use real AWS services.

---

## Step 6 — Verify It Works

### Test Bedrock (AI Plan Generation)
Open [http://localhost:8000/docs](http://localhost:8000/docs) → try `POST /api/plan`

Expected response will have `"source": "Amazon Bedrock (Claude 3)"` instead of `"Built-in Fallback"`.

### Test SNS (SMS Alert)
Try `POST /api/alert` with your own verified phone number.

> ⚠️ SNS SMS is in **sandbox mode** by default — it can only send to phone numbers you manually verify in the SNS console under **Text messaging (SMS) → Sandbox destination phone numbers**.
> To send to any number, request production access from the SNS console.

---

## Cost Estimate (Hackathon Demo)

| Service | Usage | Cost |
|---|---|---|
| Bedrock Claude 3 Haiku | ~100 requests × 300 tokens | < $0.01 |
| SNS SMS (India) | ~10 messages | < $0.10 |

---

## Planned AWS Expansions (Future Roadmap)

| Service | Purpose |
|---|---|
| **Amazon DynamoDB** | Store historical water demand, supply logs, and ward data |
| **AWS Lambda** | Serverless, event-driven score recalculation when new data arrives |
| **AWS IoT Core** | Ingest real-time smart meter data and tank levels |
| **Amazon SageMaker** | Train ML models on past demand to replace rules-based assumptions |
