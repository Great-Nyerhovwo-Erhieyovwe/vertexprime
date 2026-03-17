# 🎓 Admin Panel Quick Start Guide

## 👋 Welcome to Vertex Prime Admin

This guide walks you through using each admin feature step-by-step.

---

## 🔐 Step 1: Admin Login

1. Go to `http://localhost:5173/admin`
2. Enter credentials:
   - **Email**: `vertexprimecapitals@gmail.com`
   - **Password**: `VPrime@101`
3. Click **Login**
4. You'll be redirected to the admin dashboard

---

## 📊 Dashboard Tabs Overview

The admin dashboard has 9 tabs. Click any tab to switch sections.

### Tab 1: **Overview** 📈
View key business metrics at a glance:
- **Registered Users**: Total user count
- **Total Deposits**: Sum of all deposit transactions
- **Total Withdrawals**: Sum of all withdrawal transactions
- **Active Users**: Users with non-zero balances
- **Verified Users**: Users who completed KYC

**No actions available** - this is read-only metrics display.

---

### Tab 2: **Users** 👥
Complete user account management.

#### View Users
- Left panel shows all registered users
- Click a user to select them
- Selected user shows in right sidebar

#### Edit User Profile
1. Click a user to select
2. Right sidebar shows edit form
3. Modify any fields:
   - First/Last Name
   - Email address
   - Country
   - Balance (USD)
   - ROI (Return on Investment %)
4. Click **Save Changes**

#### Edit Bank Details
Right sidebar has "Bank Account Details" section:
- Account Holder Name (e.g., "John Doe")
- Bank Name (e.g., "Chase Bank")
- Account Number (e.g., "1234567890")
- Routing Number (e.g., "123456789")
5. Click **Save Changes**

#### Edit Crypto Wallets
Right sidebar has "Crypto Wallet Addresses" section:
- Bitcoin Address (starts with "1" or "3")
- Ethereum Address (starts with "0x")
- Other Crypto Addresses (USDT, XRP, etc.)
6. Click **Save Changes**

#### Account Controls
Three checkboxes for account status:
- **Ban User**: Disable login completely
- **Freeze Account**: Allow login but restrict trading
- Check/uncheck as needed
- Click **Save Changes**

#### View Password
- Password field shows hashed value (read-only)
- Click eye icon (👁️) to show/hide
- This is just for viewing (cannot change here)

#### Delete User
- Click **Delete** button (right panel)
- Confirms permanent removal
- User account deleted from system

**Tips**:
- Always fill required fields
- Balance can be positive or negative
- ROI typically 0-100+
- Click on a user again to reload latest data

---

### Tab 3: **Transactions** 💳
Approve or reject user deposits and withdrawals.

#### View Transactions
- Left panel shows all pending transactions
- Transaction shows: Amount, Type (Deposit/Withdrawal), User
- Click transaction to select
- Right sidebar shows details

#### Transaction Details
- Amount (USD)
- Type: "deposit" or "withdrawal"
- User email
- Created date
- Status: "pending"

#### Approve Deposit
1. Click a pending deposit
2. Optionally add admin notes (reason for approval)
3. Check **Credit Balance** checkbox (auto-credits user balance)
4. Click **Approve** button
5. User's balance increased by transaction amount

#### Approve Withdrawal
1. Click a pending withdrawal
2. Optionally add notes
3. Uncheck **Credit Balance** (auto-debits balance)
4. Click **Approve** button
5. User's balance decreased by transaction amount

#### Reject Transaction
1. Click a pending transaction
2. Add admin notes (reason for rejection)
3. Click **Reject** button
4. Transaction marked as "rejected"
5. User balance NOT affected

**Tips**:
- Always verify user identity before approval
- Add notes explaining your decision
- Rejected transactions keep user balance unchanged
- Approved deposits credit the balance automatically

---

### Tab 4: **Trades** 📈
Close active trades and calculate profit/loss.

#### View Trades
- Left panel shows all active trades
- Shows: Entry Price, Quantity, User, Current Status
- Click trade to select
- Right sidebar shows close form

#### Trade Details
- Entry Price (opening price)
- Quantity (shares/contracts)
- User email
- Created date
- Status: "active"

#### Close a Trade
1. Click an active trade
2. In right sidebar, enter:
   - **Exit Price**: The price at which trade closed
   - **Result**: Select from dropdown:
     - "win" = Trade was profitable
     - "loss" = Trade was unprofitable
     - "cancelled" = Trade was cancelled
3. Optionally add admin notes
4. Click **Close Trade** button
5. Trade status changes to "closed"

#### P/L Calculation
System automatically calculates:
```
Profit/Loss = (Exit Price - Entry Price) × Quantity
```

Example:
- Entry Price: $100
- Exit Price: $120
- Quantity: 10 shares
- **P/L = ($120 - $100) × 10 = $200 profit**

**Tips**:
- Make sure Exit Price is correct
- Select the correct result (win/loss)
- Notes help track why you closed it
- System stores P/L for reporting

---

### Tab 5: **Verifications** ✅
Review and approve KYC (Know Your Customer) documents.

#### View Verifications
- Left panel shows all pending verifications
- Shows: Status (pending), User name, Email
- Click verification to select
- Right sidebar shows review form

#### Verification Details
- User name and email
- KYC document status
- Verification date
- Status: "pending"

#### Approve KYC
1. Click a pending verification
2. Review the user's KYC documents
3. Click **Approve** button
4. User is marked as "emailVerified: true"
5. User can now trade/withdraw

#### Reject KYC
1. Click a pending verification
2. In right sidebar, enter **Reason** for rejection:
   - Examples: "Document unclear", "ID expired", "Name mismatch"
3. Click **Reject** button
4. Verification stored with rejection reason
5. User can re-submit documents

**Tips**:
- Always verify documents are clear and valid
- Check ID is not expired
- Ensure name matches account
- Keep notes on rejections for user feedback

---

### Tab 6: **Upgrades** 📦
Create and manage user upgrade plans.

#### View Plans
- Left panel shows all upgrade plans
- Shows: Plan name, Monthly/Annual price, Feature count
- Click plan to select
- Right sidebar shows edit form

#### Create New Plan
1. Click **+ New Plan** button
2. Right sidebar shows blank form
3. Enter plan details:
   - **Plan Name**: e.g., "Premium", "Gold", "Platinum"
   - **Monthly Price**: e.g., 99
   - **Annual Price**: e.g., 999
   - **Features**: Comma-separated list
     - Example: "Advanced Analytics, Priority Support, Custom Indicators"
4. Click **Save Plan**
5. Plan added to system

#### Edit Existing Plan
1. Click a plan from the list
2. Right sidebar fills with plan details
3. Modify any fields you want to change
4. Click **Save Plan**
5. Changes applied immediately

#### Delete Plan
1. Click a plan to select
2. Click **Delete** button
3. Plan removed from system
4. Existing users keep their current plan

**Tips**:
- Monthly price usually 10% of annual
- Examples of features:
  - "Advanced Analytics"
  - "Priority Support"
  - "Custom Indicators"
  - "Higher Trading Limits"
  - "API Access"
- Can have 3-5 features per plan

---

### Tab 7: **Messages** 💬
Send direct messages, warnings, and notices to users.

#### Send Direct Message
1. Select **Message Type**: Choose "Direct" (📧)
2. In left panel, click a user to select them
3. Message appears in "Selected User" field
4. In right sidebar, type your message
5. Click **Send Message**
6. User receives private message

#### Send Warning
1. Select **Message Type**: Choose "Warning" (⚠️)
2. No user selection needed for warnings
3. Type warning message (e.g., "Unusual trading activity detected")
4. Click **Send Message**
5. User notified of account warning

#### Send System Notice
1. Select **Message Type**: Choose "Notice" (ℹ️)
2. No user selection needed for notices
3. Type notice message (e.g., "System maintenance tonight")
4. Click **Send Message**
5. Users receive system information

**Tips**:
- Direct messages are private (1 user)
- Warnings are for policy violations
- Notices are broadcast to multiple/all users
- Keep messages clear and professional
- Can include timestamps and details

---

### Tab 8: **Email** 📧
Send emails to individual or bulk users with templates.

#### Send Individual Email
1. In left panel, click a user to select them
2. User email shows in form
3. Select **Template** or keep as "Custom"
4. Enter **Subject** and **Message**
5. Click **Send Email(s)**

#### Send Bulk Email
1. In right sidebar **"Or Enter Emails"** field:
   - Type one email per line:
   ```
   user1@example.com
   user2@example.com
   user3@example.com
   ```
2. Enter **Subject** and **Message**
3. Click **Send Email(s)**

#### Use Email Template
1. Click **Template** dropdown
2. Choose from pre-built templates:
   - **Welcome Email**: First-time user welcome
   - **Verification Reminder**: Remind to complete KYC
   - **Upgrade Notification**: Announce new plan
   - **Deposit Confirmation**: Confirm deposit receipt
3. Template auto-fills Subject and Message
4. Modify if needed
5. Click **Send Email(s)**

**Template Examples**:
- Welcome: "Thank you for joining. Please complete your profile..."
- Verification: "Your account upgrade is waiting. Verify your identity..."
- Upgrade: "Congratulations! You're eligible for premium features..."
- Deposit: "Your deposit of $XXX has been received..."

**Tips**:
- Personalize messages when possible
- Use professional tone
- Include clear call-to-action
- Test email before sending bulk
- Keep subject lines clear

---

### Tab 9: **Support** 🎫
Respond to user support tickets.

#### View Tickets
- Left panel shows all support tickets
- Shows: Ticket ID, Status, Priority, User
- Status colors: Red=open, Yellow=in-progress, Blue=resolved, Green=closed
- Priority: Critical (red), High (orange), Medium (yellow), Low (green)
- Click ticket to select
- Right sidebar shows details

#### Ticket Details
- Ticket ID (auto-generated)
- Subject (user's issue title)
- User email and name
- Original message/problem
- Priority level
- Creation date

#### Reply to Ticket
1. Click a ticket to select
2. In right sidebar, type your response
3. Change **Status** dropdown if needed:
   - "open" → "in-progress" (you're working on it)
   - "in-progress" → "resolved" (issue fixed)
   - "resolved" → "closed" (user confirmed fix)
4. Click **Send Reply & Update Status**
5. Reply added to ticket history

#### Example Workflow
1. User submits ticket (Status: open)
2. Admin reviews (Change to: in-progress)
3. Admin replies with solution
4. User confirms it works
5. Admin closes ticket (Change to: closed)

**Tips**:
- Respond promptly to high-priority tickets
- Be clear and helpful in responses
- Keep professional tone
- Update status as you progress
- Reference previous conversation

---

## ⚙️ Common Tasks

### Task: Reset User Balance
1. Go to **Users** tab
2. Click the user
3. Change "Balance (USD)" field
4. Click **Save Changes**

### Task: Verify Unverified User
1. Go to **Verifications** tab
2. Click user's verification request
3. Click **Approve**
4. User marked as verified

### Task: Approve Pending Withdrawal
1. Go to **Transactions** tab
2. Find pending withdrawal
3. Uncheck "Credit Balance"
4. Click **Approve**

### Task: Create New Subscription Plan
1. Go to **Upgrades** tab
2. Click **+ New Plan**
3. Enter name, prices, features
4. Click **Save Plan**

### Task: Send Alert to User
1. Go to **Messages** tab
2. Select "Warning" type
3. Type warning message
4. Click **Send Message**

---

## 🚨 Important Notes

### Data Integrity
- Verify information before making changes
- Changes are permanent
- Deleted users cannot be recovered
- Always add notes for audit trail

### Security
- Never share admin credentials
- Log out when finished
- Don't send sensitive data via email
- Review all changes carefully

### User Experience
- Be professional in all communications
- Respond to support tickets promptly
- Provide clear explanations
- Help resolve issues fairly

---

## ❓ Troubleshooting

### User Won't Login
- Check if user is **banned** (Users tab)
- Check if account is **frozen** (Users tab)
- Verify email/password are correct
- User might not be verified (Verifications tab)

### Transaction Not Showing
- Check if it's actually pending (status might be approved/rejected)
- Verify user account exists
- Check created date range

### Email Not Sending
- Verify email addresses are correct
- Check for typos in recipient list
- Ensure user email is valid
- Bulk emails sent one per line

### Can't Approve KYC
- Make sure documents are visible
- Check ID hasn't expired
- Verify name matches account
- Ensure document is clear

---

## 📞 Support

If you encounter issues:
1. Check this guide for solutions
2. Review error messages shown
3. Verify all input data is correct
4. Check network connection
5. Refresh page if needed

---

**Good luck with your admin duties!** 🎉

Last Updated: 2024
