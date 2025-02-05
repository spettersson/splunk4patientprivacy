## **Data Sources**  

Splunk can collect, index, search, correlate, and visualize data from any system or vendor that records **create**, **read**, **update**, **delete**, and **export** activities related to patient journals.  

When onboarding data from a new system, it is crucial to provide Splunk with the right instructions (configurations) so that it can correctly interpret and index the data as **individual events**—where each event represents something that happened at a specific point in time.  

Since different systems (or even different data streams within the same system) may have different log formats, Splunk must handle them differently. To achieve this, Splunk assigns each data format a unique **sourcetype**. The **sourcetype** defines the required configurations for proper **event parsing and indexing**.  

### **Sourcetype Configurations**  

A sourcetype consists of two key categories of configurations:  

### **1. Event Line Breaking Configurations**  
These configurations determine how Splunk separates individual events within raw log data. If configured incorrectly, Splunk may group unrelated log entries into a single event or split a single event into multiple fragments, making searches and correlation difficult.  

```ini
[<sourceTypeName>]
LINE_BREAKER = <regular_expression>   # Defines how raw text is broken into separate events.
SHOULD_LINEMERGE = <true|false>       # If true, Splunk attempts to merge lines into multi-line events. 
```

- **`LINE_BREAKER`**: A regular expression that tells Splunk where one event ends, and the next begins.
- **`SHOULD_LINEMERGE`**: When `true`, Splunk will try to combine multiple lines into a single event if they appear to be related (e.g., stack traces). When `false`, Splunk will strictly follow `LINE_BREAKER`.

### **2. Timestamp Assignment Configurations**  
These configurations define how Splunk **extracts and interprets timestamps** from events, ensuring they are assigned the correct time for indexing.  

```ini
TIME_PREFIX = <regular_expression>     # Defines where the timestamp is located in the raw event.
TIME_FORMAT = <strptime-style format>  # Defines the timestamp format so Splunk can parse it correctly.
TZ = <timezone identifier>             # Specifies the time zone of the log source.
```

- **`TIME_PREFIX`**: A regular expression that tells Splunk where to look for the timestamp in an event.
- **`TIME_FORMAT`**: A format string (following `strptime` syntax) that defines how Splunk should interpret the timestamp.
- **`TZ`**: Specifies the time zone of the system that generated the logs, ensuring proper time alignment in searches.

---



  
 






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
        


