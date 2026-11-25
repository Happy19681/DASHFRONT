const select = (key, label, options, required = true) => ({ key, label, type: "select", options, required });
const text = (key, label, required = false, options = {}) => ({ key, label, type: "text", required, ...options });
const number = (key, label, required = true, format = "number") => ({ key, label, type: "number", required, format });
const date = (key, label) => ({ key, label, type: "date", required: true });
const area = (key, label, required = false) => ({ key, label, type: "textarea", required });

export const pageResources = {
  products: {
    title: "Products",
    singular: "product",
    resource: "products",
    description: "Manage the products available in your store.",
    fields: [text("name", "Product name", true), text("category", "Category", true), number("price", "Price", true, "currency"), number("stock", "Stock", true, "number"), select("status", "Status", ["Active", "Draft", "Archived"])],
  },
  reports: {
    title: "Reports & Analytics",
    singular: "report",
    resource: "reports",
    description: "Save report definitions for the periods you review.",
    fields: [text("title", "Report name", true), select("period", "Period", ["Daily", "Weekly", "Monthly", "Yearly"]), area("description", "Description"), select("status", "Status", ["Saved", "Draft"])],
  },
  messages: {
    title: "Messages",
    singular: "message",
    resource: "messages",
    description: "Keep customer and team messages organized.",
    fields: [text("subject", "Subject", true), text("recipient", "Recipient", true), area("message", "Message", true), select("status", "Status", ["Unread", "Read", "Archived"])],
  },
  "team-performance": {
    title: "Team Performance",
    singular: "team member",
    resource: "team-performance",
    description: "Track sales targets for your team members.",
    fields: [text("name", "Team member", true), text("role", "Role", true), number("sales", "Sales", true, "currency"), number("target", "Target", true, "currency"), select("status", "Status", ["Active", "Inactive"])],
  },
  campaigns: {
    title: "Campaigns",
    singular: "campaign",
    resource: "campaigns",
    description: "Manage campaign budgets, channels, and schedules.",
    fields: [text("name", "Campaign name", true), text("channel", "Channel", true), number("budget", "Budget", true, "currency"), date("startDate", "Start date"), date("endDate", "End date"), select("status", "Status", ["Draft", "Active", "Completed"])],
  },
  customers: {
    title: "Customer List",
    singular: "customer",
    resource: "customers",
    description: "Manage customer contact details and account status.",
    fields: [text("name", "Customer name", true), text("email", "Email", true, { type: "email" }), text("phone", "Phone"), select("status", "Status", ["Active", "Inactive"]), area("notes", "Notes")],
  },
  channels: {
    title: "Channels",
    singular: "channel",
    resource: "channels",
    description: "Track the sales and communication channels your team uses.",
    fields: [text("name", "Channel name", true), text("type", "Type", true), text("url", "URL", false, { type: "url" }), select("status", "Status", ["Connected", "Paused", "Disconnected"])],
  },
  orders: {
    title: "Order Management",
    singular: "order",
    resource: "orders",
    description: "Manage order records and their fulfillment status.",
    fields: [text("orderNumber", "Order number", true), text("customer", "Customer", true), text("product", "Product", true), number("quantity", "Quantity", true, "number"), number("amount", "Amount", true, "currency"), select("status", "Status", ["Pending", "Processing", "Completed", "Cancelled"]), date("date", "Order date")],
  },
  roles: {
    title: "Roles & Permissions",
    singular: "role",
    resource: "roles",
    description: "Manage roles and list their permissions.",
    fields: [text("name", "Role name", true), area("description", "Description"), area("permissions", "Permissions", true), select("status", "Status", ["Active", "Inactive"])],
  },
  billing: {
    title: "Billing & Subscription",
    singular: "subscription record",
    resource: "billing",
    description: "Manage subscription records and billing dates.",
    fields: [text("plan", "Plan", true), number("amount", "Amount", true, "currency"), select("billingCycle", "Billing cycle", ["Monthly", "Annual"]), select("status", "Status", ["Active", "Past due", "Cancelled"]), date("nextBillingDate", "Next billing date")],
  },
  integrations: {
    title: "Integrations",
    singular: "integration",
    resource: "integrations",
    description: "Keep a record of connected external services.",
    fields: [text("name", "Integration name", true), text("provider", "Provider", true), area("details", "Details"), select("status", "Status", ["Connected", "Disconnected"])],
  },
  support: {
    title: "Customer Support",
    singular: "support ticket",
    resource: "support",
    description: "Track customer support requests and their priority.",
    fields: [text("subject", "Subject", true), text("customer", "Customer", true), select("priority", "Priority", ["Low", "Medium", "High"]), select("status", "Status", ["Open", "In Progress", "Resolved"]), area("description", "Description")],
  },
  "help-center": {
    title: "Help Center",
    singular: "article",
    resource: "help-center",
    description: "Create and maintain help-center articles.",
    fields: [text("title", "Article title", true), text("category", "Category", true), area("content", "Article content", true), select("status", "Status", ["Draft", "Published"])],
  },
  settings: {
    title: "System Settings",
    singular: "setting",
    resource: "settings",
    description: "Store editable key-value settings for this dashboard.",
    fields: [text("key", "Setting key", true), area("value", "Value", true), area("description", "Description")],
  },
};
