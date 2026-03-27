# HubSpot Survey Integration – Full Property Mapping

## Overview

This document defines all required properties for:

1. Contact Object (trigger, suppression, rollups)
2. DM Customer Feedback Custom Object (survey records)

\---

# 1\. CONTACT OBJECT PROPERTIES

## A. Trigger Fields (CRM → HubSpot)

|Label|Internal Name|Type|Options|
|-|-|-|-|
|Requested Survey Type|requested\_survey\_type|Dropdown|support, sales, termination, onboarding, install|
|Requested Survey Trigger|requested\_survey\_trigger|Dropdown|ticket\_closed, sale\_closed, cancellation\_requested, onboarding\_completed, installation\_completed, manual\_request|
|Requested Survey Reference ID|requested\_survey\_reference\_id|Single-line text|—|
|Survey Send Requested At|survey\_send\_requested\_at|DateTime|—|
|Survey Send Requested By System|survey\_send\_requested\_by\_system|Single-line text|—|
|Requested Survey Record ID|requested\_survey\_record\_id|Single-line text|—|

\---

## B. Suppression Fields

|Label|Internal Name|Type|Options|
|-|-|-|-|
|Survey Opt Out|survey\_opt\_out|Checkbox|true/false|
|Survey Suppression Until|survey\_suppression\_until|Date|—|
|Last Survey Sent Date|last\_survey\_sent\_date|DateTime|—|
|Last Support Survey Sent Date|last\_support\_survey\_sent\_date|DateTime|—|
|Last Sales Survey Sent Date|last\_sales\_survey\_sent\_date|DateTime|—|
|Last Termination Survey Sent Date|last\_termination\_survey\_sent\_date|DateTime|—|

\---

## C. Latest Survey Snapshot Fields

|Label|Internal Name|Type|Options|
|-|-|-|-|
|Latest Survey Type|latest\_survey\_type|Dropdown|support, sales, termination, onboarding, install|
|Latest Survey Rating|latest\_survey\_rating|Number|—|
|Latest Survey Completed Date|latest\_survey\_completed\_date|DateTime|—|
|Latest Survey Feedback|latest\_survey\_feedback|Multi-line text|—|
|Latest Testimonial Permission|latest\_testimonial\_permission|Dropdown|yes, no|

\---

# 2\. DM CUSTOMER FEEDBACK CUSTOM OBJECT

## A. Core Fields

|Label|Internal Name|Type|Options|
|-|-|-|-|
|Survey ID|survey\_id|Single-line text|—|
|Survey Type|survey\_type|Dropdown|support, sales, termination, onboarding, install|
|Survey Status|survey\_status|Dropdown|pending, sent, completed, suppressed, expired, failed|
|Survey Trigger|survey\_trigger|Dropdown|ticket\_closed, sale\_closed, cancellation\_requested, onboarding\_completed, installation\_completed, manual\_request|
|Survey Version|survey\_version|Single-line text|—|
|Survey Source System|survey\_source\_system|Single-line text|—|

\---

## B. CRM Reference Fields

|Label|Internal Name|Type|Options|
|-|-|-|-|
|CRM Event Source|crm\_event\_source|Single-line text|—|
|CRM Reference ID|crm\_reference\_id|Single-line text|—|
|Ticket ID|ticket\_id|Single-line text|—|
|Deal ID|deal\_id|Single-line text|—|
|Service ID|service\_id|Single-line text|—|

\---

## C. Lifecycle / Timing Fields

|Label|Internal Name|Type|Options|
|-|-|-|-|
|Survey Requested At|survey\_requested\_at|DateTime|—|
|Survey Sent Date|survey\_sent\_date|DateTime|—|
|Survey Completed Date|survey\_completed\_date|DateTime|—|
|Submitted At|submitted\_at|DateTime|—|
|Submission URL|submission\_url|URL|—|
|Feedback Path|feedback\_path|Single-line text|—|
|Suppression Reason|suppression\_reason|Single-line text|—|
|Delivery Notes|delivery\_notes|Multi-line text|—|

\---

## D. Response Fields

|Label|Internal Name|Type|Options|
|-|-|-|-|
|Survey Rating|survey\_rating|Number|—|
|Survey Feedback|survey\_feedback|Multi-line text|—|
|Testimonial Permission|testimonial\_permission|Dropdown|yes, no|
|Follow Up Required|follow\_up\_required|Checkbox|true/false|
|Internal Notes|internal\_notes|Multi-line text|—|

\---

# 3\. ASSOCIATIONS

DM Customer Feedback should be associated with:

* Contact (required)
* 

\---

# 4\. SUMMARY

* Contact = trigger + suppression + latest snapshot
* DM Customer Feedback = full survey history (1 record per survey)
* CRM writes to Contact
* CRM reads from DM Customer Feedback

