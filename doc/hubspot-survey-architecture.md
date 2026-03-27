# HubSpot Survey Integration – Architecture Guide

## Overview

This document defines the recommended architecture for integrating surveys between your CRM, HubSpot, and your survey application.

---

## Core Principle

- Use ONE custom object for all surveys: survey_submission
- Create ONE record per survey submission
- Associate each record to a Contact
- Use a survey_type field to differentiate survey types

---

## Architecture Flow

CRM → HubSpot → Email → Survey Page → HubSpot → CRM

1. CRM triggers survey
2. HubSpot creates survey record
3. HubSpot sends email
4. User completes survey
5. Data updates survey record
6. CRM can pull results

---

## HubSpot Data Model

### Contact Object (Summary Only)

Store:
- latest_survey_type
- latest_survey_score
- latest_survey_date

---

### Custom Object: survey_submission

#### Core Properties

- survey_type (sales, support, termination)
- survey_status (sent, completed)
- survey_sent_date
- survey_completed_date
- survey_score
- nps_score
- survey_feedback
- would_recommend
- crm_event_source
- crm_reference_id
- survey_id

---

#### Optional Properties (Only if needed)

- sales_rep_rating
- support_resolution_rating
- termination_reason

---

## CRM → HubSpot Trigger

### API Action

Update or create survey record

Example:

{
  "survey_type": "support",
  "crm_event_source": "ticket_closed",
  "survey_status": "sent"
}

---

## Workflow in HubSpot

Trigger:
- survey_status = sent

Branches:
- If survey_type = sales → send sales survey email
- If survey_type = support → send support survey email
- If survey_type = termination → send exit survey email

---

## Survey Email

Include link:

https://yourdomain.com/survey?survey_id=123&type=support

---

## Survey Submission

On submit:

Update survey_submission record:

- survey_score
- survey_feedback
- survey_status = completed
- survey_completed_date

---

## CRM Data Pull

CRM can retrieve:

- survey_type
- survey_score
- survey_feedback
- survey_status

---

## Best Practices

DO:
- Use one object
- Use shared properties
- Track history per submission

DO NOT:
- Create separate objects per survey type
- Create duplicate properties per survey

---

## Summary

- One object = scalable
- One record per survey = clean history
- survey_type = segmentation
