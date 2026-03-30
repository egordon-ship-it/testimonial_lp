# HubSpot Survey Integration – Cursor-Ready Field Mapping

## Purpose

This file is the source of truth for the survey project field mapping between HubSpot Contact properties and the **DM Customer Feedback** custom object.

Use this file when building:
- HubSpot API payloads
- survey form submit handlers
- survey email link generation
- suppression logic
- workflow trigger logic
- CRM ↔ HubSpot sync logic

---

## Core Rules

### Contact object
Use the **Contact** object for:
- survey trigger fields
- suppression / cooldown fields
- latest survey snapshot / rollup fields

### DM Customer Feedback custom object
Use the **DM Customer Feedback** custom object for:
- one record per survey instance
- survey lifecycle/status fields
- survey response fields
- CRM reference fields tied to the survey instance

---

## Object Mapping Table

| Object | Group | Label | Internal Name | Type | Options / Notes | Primary Use |
|---|---|---|---|---|---|---|
| contact | Trigger | Requested Survey Type | `requested_survey_type` | Dropdown | support, sales, termination, onboarding, install | CRM writes this to request a survey send |
| contact | Trigger | Requested Survey Trigger | `requested_survey_trigger` | Dropdown | ticket_closed, sale_closed, cancellation_requested, onboarding_completed, installation_completed, manual_request | CRM writes reason for send |
| contact | Trigger | Requested Survey Reference ID | `requested_survey_reference_id` | Single-line text | External CRM ID like ticket/order/cancellation ID | CRM writes this |
| contact | Trigger | Survey Send Requested At | `survey_send_requested_at` | Date and time | Timestamp when CRM requested send | CRM writes this |
| contact | Trigger | Survey Send Requested By System | `survey_send_requested_by_system` | Single-line text | Example: CRM | Optional source system name |
| contact | Trigger | Requested Survey Record ID | `requested_survey_record_id` | Single-line text | Unique survey instance ID if known before email send | Used in survey email link |
| contact | Suppression | Survey Opt Out | `survey_opt_out` | Single checkbox | true/false | Prevent all survey sends |
| contact | Suppression | Survey Suppression Until | `survey_suppression_until` | Date | Do not send until after this date | Global suppression window |
| contact | Suppression | Last Survey Sent Date | `last_survey_sent_date` | Date and time | Most recent survey of any type | Global cooldown reference |
| contact | Suppression | Last Support Survey Sent Date | `last_support_survey_sent_date` | Date and time | Most recent support survey | Per-type cooldown reference |
| contact | Suppression | Last Sales Survey Sent Date | `last_sales_survey_sent_date` | Date and time | Most recent sales survey | Per-type cooldown reference |
| contact | Suppression | Last Termination Survey Sent Date | `last_termination_survey_sent_date` | Date and time | Most recent termination survey | Per-type cooldown reference |
| contact | Latest Snapshot | Latest Survey Type | `latest_survey_type` | Dropdown | support, sales, termination, onboarding, install | Latest completed survey type |
| contact | Latest Snapshot | Latest Survey Rating | `latest_survey_rating` | Number | Numeric rating | Latest completed survey rating |
| contact | Latest Snapshot | Latest Survey Completed Date | `latest_survey_completed_date` | Date and time | Most recent completed survey date | Rollup field |
| contact | Latest Snapshot | Latest Survey Feedback | `latest_survey_feedback` | Multi-line text | Most recent survey comment | Rollup field |
| contact | Latest Snapshot | Latest Testimonial Permission | `latest_testimonial_permission` | Dropdown | yes, no | Latest permission answer |
| dm_customer_feedback | Core | Survey ID | `survey_id` | Single-line text | Unique survey instance ID | Primary survey instance identifier |
| dm_customer_feedback | Core | Survey Type | `survey_type` | Dropdown | support, sales, termination, onboarding, install | Survey category stored on record |
| dm_customer_feedback | Core | Survey Status | `survey_status` | Dropdown | pending, sent, completed, suppressed, expired, failed | Survey lifecycle state |
| dm_customer_feedback | Core | Survey Trigger | `survey_trigger` | Dropdown | ticket_closed, sale_closed, cancellation_requested, onboarding_completed, installation_completed, manual_request | Business event causing survey |
| dm_customer_feedback | Core | Survey Version | `survey_version` | Single-line text | Example: v1 | Helps track form/template revisions |
| dm_customer_feedback | Core | Survey Source System | `survey_source_system` | Single-line text | Example: CRM | Origin system |
| dm_customer_feedback | CRM Reference | CRM Event Source | `crm_event_source` | Single-line text | Raw source string from CRM | External context |
| dm_customer_feedback | CRM Reference | CRM Reference ID | `crm_reference_id` | Single-line text | Generic CRM reference ID | External context |
| dm_customer_feedback | CRM Reference | Ticket ID | `ticket_id` | Single-line text | Optional support-specific ID | Optional convenience field |
| dm_customer_feedback | CRM Reference | Deal ID | `deal_id` | Single-line text | Optional sales-specific ID | Optional convenience field |
| dm_customer_feedback | CRM Reference | Service ID | `service_id` | Single-line text | Optional service/subscription ID | Optional convenience field |
| dm_customer_feedback | Lifecycle | Survey Requested At | `survey_requested_at` | Date and time | When request was made | Lifecycle timestamp |
| dm_customer_feedback | Lifecycle | Survey Sent Date | `survey_sent_date` | Date and time | When HubSpot actually sent email | Lifecycle timestamp |
| dm_customer_feedback | Lifecycle | Survey Completed Date | `survey_completed_date` | Date and time | When user completed survey | Lifecycle timestamp |
| dm_customer_feedback | Lifecycle | Submitted At | `submitted_at` | Date and time | Frontend submission timestamp | Submission timestamp |
| dm_customer_feedback | Lifecycle | Submission URL | `submission_url` | URL | Survey landing page URL | Audit/debug |
| dm_customer_feedback | Lifecycle | Feedback Path | `feedback_path` | Single-line text | Example: /service | Route/path used |
| dm_customer_feedback | Lifecycle | Suppression Reason | `suppression_reason` | Single-line text | Reason send was blocked | Suppression audit |
| dm_customer_feedback | Lifecycle | Delivery Notes | `delivery_notes` | Multi-line text | Failure or send notes | Debug/support |
| dm_customer_feedback | Response | Survey Rating | `survey_rating` | Number | Star / score value | Customer response |
| dm_customer_feedback | Response | Survey Feedback | `survey_feedback` | Multi-line text | Customer comment | Customer response |
| dm_customer_feedback | Response | Testimonial Permission | `testimonial_permission` | Dropdown | yes, no | Permission for reuse |
| dm_customer_feedback | Response | Follow Up Required | `follow_up_required` | Single checkbox | true/false | Internal follow-up flag |
| dm_customer_feedback | Response | Internal Notes | `internal_notes` | Multi-line text | Team-only notes | Internal use |
| dm_customer_feedback | Follow-Up | Survey Owner | `survey_owner` | HubSpot user | Internal owner | Optional ownership |
| dm_customer_feedback | Follow-Up | Follow Up Status | `follow_up_status` | Dropdown | not_needed, needed, in_progress, completed | Recovery / follow-up status |
| dm_customer_feedback | Follow-Up | Follow Up Completed Date | `follow_up_completed_date` | Date and time | When follow-up finished | Optional lifecycle field |

---

## Survey Email Link Mapping

When building survey links in HubSpot emails, use **Contact** properties for personalization tokens.

Recommended pattern:

```text
https://dm-customer-testimonial.web.app/service?survey_record_id={{contact.requested_survey_record_id}}&reference_id={{contact.requested_survey_reference_id}}&survey_type={{contact.requested_survey_type}}&template=service&email={{contact.email}}
```

### Link parameter meaning

| Query Param | Source Property | Object | Purpose |
|---|---|---|---|
| `survey_record_id` | `requested_survey_record_id` | contact | Links click to specific survey instance |
| `reference_id` | `requested_survey_reference_id` | contact | CRM reference ID |
| `survey_type` | `requested_survey_type` | contact | Tells frontend which survey to render |
| `template` | static value | n/a | Frontend layout/template selector |
| `email` | `email` | contact | Optional fallback/debug identifier |

---

## Implementation Rules for Cursor

1. Do **not** assume all survey fields belong on the Contact object.
2. Use **Contact** properties for:
   - email personalization tokens
   - workflow trigger logic
   - suppression checks
   - latest rollup values
3. Use **DM Customer Feedback** properties for:
   - survey record creation
   - survey status updates
   - survey response storage
   - lifecycle timestamps
4. When building the survey submit flow:
   - prefer updating an existing **DM Customer Feedback** record using `survey_record_id`
   - if no survey record exists yet, create one and associate it to the Contact
5. Keep `requested_survey_type` and `survey_type` values aligned exactly.
6. Keep `requested_survey_trigger` and `survey_trigger` values aligned exactly.

---

## Recommended Data Flow

### CRM → HubSpot trigger
CRM updates **Contact** with:
- `requested_survey_type`
- `requested_survey_trigger`
- `requested_survey_reference_id`
- `survey_send_requested_at`
- optionally `requested_survey_record_id`

### HubSpot → email send
HubSpot workflow reads **Contact** trigger fields and suppression fields, then sends the correct email.

### Survey app → HubSpot response update
Survey app updates **DM Customer Feedback** with:
- `survey_status`
- `survey_rating`
- `survey_feedback`
- `testimonial_permission`
- `survey_completed_date`
- `submitted_at`

### Optional rollup back to Contact
After survey completion, update **Contact** with:
- `latest_survey_type`
- `latest_survey_rating`
- `latest_survey_completed_date`
- `latest_survey_feedback`
- `latest_testimonial_permission`

---

## Associations

**DM Customer Feedback** should be associated with:
- Contact (required)
- Ticket (optional)
- Deal (optional)

---

## Summary

- **Contact** = trigger + suppression + latest snapshot
- **DM Customer Feedback** = full survey history, one record per survey
- CRM writes survey send requests to **Contact**
- Survey app writes survey results to **DM Customer Feedback**
