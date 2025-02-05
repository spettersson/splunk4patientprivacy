## **Event formatting**

Splunk can handle data coming from any system from any vendor that include **create**, **read**, **update**, **delete**, and **export** activities related to patient journals.

When onboarding data from a new system, it is important to provide Splunk with the right instructions (that is, configurations) so that it can understand the format of the data and correctly index the data as individual events (where each event can tell us about something that happend at a specific point of time). Since data from different systems (sometimes even different data streams from the same system) may have different formats, Splunk needs to treat them differently and it does so by assigning them a unique source**type** that includes the configuration that Splunk needs.

A sourcetype includes configurations that fall into two main categories: event line breaking and timestamp extraction.

Event line breaking

Splunk needs to know what separates one event from another (that is, event boundaries) so we don't end up with for example one and a half log records in a single event (will make filtering and correlation difficult). 

Splunk stores the incoming data as events, where each event is a record of something that happend at a specific point of time - thus, Splunk needs information about how it should break the data into events before indexing (for example, we don't want one and a half log record within the same event). How this is done depends on if we are dealing with single line or multi line events - for single line events, you simply set the LINE_BREAKING key

LINE_BREAKING = <regular_expression>
- Specifies how raw text is browing into events
- Default: ([\r\n])

SHOULD_MERGE = <true | false>
- Specifies if Splunk should merge lines into multi-line events
- Default: false

  Timestamp extraction



  
 






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
        


