## **Event formatting**

This repository is developed to handle events coming from any system that include **create**, **read**, **update**, **delete**, and **export** activities related to patient journals. It is important to note that it is not, in any way, limited to specific systems or vendors.

When onboarding events from a new system into Splunk, it is important to provide Splunk with instructions for how to correctly format the events. The list of possible configurations grows long, but what you should consider is what is commonly known as the magic 8:

LINE_BREAKING = <regular_expression; default: >
SHOULD_MERGE = <true | false; default: false>






## **Fields**


## **Event types**

<p align="center">
  <img src="images/eventtypes_v1.8.png" alt="eventtypes" style="width:80%;">
</p>

Event types serve as a mean to categorize events from systems that deal with patient journals. By defining field-value pairs and search terms, you can identify a group of events and save the result as an event type which then can be references in a search (for example, eventtype=journal_activity_cosmic), simplifying searches and ensuring consistency. Since Splunk uses schema-on-read, event types can be easily modified and updated over time.

Since your organization likely has multiple systems that hold events that fall into to the same event category, you will inevitably end up with multiple event types. In such cases, you can assign them a common tag. This allows you to retrieve all desired events in a single search by simply referencing a tag (for example, tag=journal_activity), without manually specifying each event type.

For the use cases in this repository, each system is expected to have **one unique event type** (that is, journal_activity_$systemName$). This event type must include events that records create/read/update/delete activities associated to patient journals. 

An event type can be created either through the Splunk UI (AKA Splunk Web) or Splunk configuration files - which approach you use depends on your preferences. The following is a step by step guide for how to create an event type in Splunk UI.

1. Navigate to **Settings > Event Types**
2. Click on **New Event Type**
3. In the **Name** field, enter a name for the event type.
   - This name should follow this naming standard: journal_activity_$systemName$ (replace $systemName$ with the system).
   - example: journal_activity_cosmic
4. In the **Search string** field, enter the field::value pairs and search terms that captures the desired group of events from the system.
   - It's best practice to reference the index, host, source, and sourcetype fields associated with the system for performance reasons. These fields are mandatory across all events in Splunk and provides important metadata about for example where it originated, what kind of data it contains, and what index it is located in.
   - Depending on the system, additional field-value pairs and search terms may be necessary to narrow down the events to the desired group of events.
   - example: index=cosmic sourcetype=cosmic source IN ("F_IX_ACCESSLOG.txt", "F_IX_ACTIVITYLOG.txt") activity_type=*
5. In the **Tag(s)** field, enter the value 'journal_activity'
    - When creating an event type via Splunk Web and reference a tag that does not already exist, Splunk automatically creates that tag for you.

Make sure to adjust permissions to ensure that the appropriate roles in Splunk have read and/or write access to the right event types.
        


