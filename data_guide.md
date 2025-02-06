## **Get Logs In**

Splunk can collect, index, search, correlate, and visualize logs from any system or vendor that records for example create, read, update, delete, and export activities related to patient journals.

When onboarding logs from a new system, it is crucial to provide Splunk with proper configurations to ensure that logs are correctly parsed and indexed. Each log record should be processed as an individual event, where each event represents something that happened at a specific point in time.

However, log formats vary significantly between systems—or even between different sources within the same system. To handle this diversity, Splunk assigns each log format a unique source**type**, which can later be referenced in searches to efficiently filter log sources.

---

### **What is a Sourcetype?**

A sourcetype is a group of configurations that tells Splunk how to correctly parse and index a specific log source. It mainly defines:
- How logs are separated into individual events (event line-breaking rules).
- How timestamps are identified and extracted (so events are placed in the correct time order).
- How field extractions work (so logs become structured and searchable).

---

### **Create Your Own Sourcetype(s)**

#### **1. Study the Log Format**
The first step is to understand the structure of your logs. Pay attention to:

✅ **Structured vs. Unstructured**: Is the log format JSON, XML, CSV, or free-text (.log, .txt)?  
✅ **Single-Line vs. Multi-Line**: Does each event fit on a single line, or does it span multiple lines?  
✅ **Event Delimiter**: How do you know where a new log record starts? (e.g., `\n` for new lines, timestamps, or a specific keyword).  
✅ **Timestamp Format**: What format does the timestamp use? (e.g., `2025-01-01T00:00:00.000000Z`, `2023-01-01 00:00:00.000`).  

---

#### **2. Understand How to Configure Event Line-Breaking**

A key role of a sourcetype is to apply [event line-breaking configurations](https://docs.splunk.com/Documentation/Splunk/latest/Data/Configureeventlinebreaking) which control how Splunk determines the start and end of each event. This prevents issues like ending up with multiple log records in a single event or a single log record split into multiple events.

Example:
```ini
LINE_BREAKER = (\n+)  # One or more newline characters are expected before the start of a new event.
SHOULD_LINEMERGE = false  # This is a single-line log, so merging is unnecessary.
```
For multi-line logs, you need to set `SHOULD_LINEMERGE = true` and take additional configurations into consideration which are explained in [Splunk Docs](https://docs.splunk.com/Documentation/SplunkCloud/latest/Data/Configureeventlinebreaking#:~:text=When%20you%20set%20SHOULD_LINEMERGE%20to%20the%20default%20of%20true%2C%20use%20these%20additional%20settings%20to%20define%20line%20breaking%20behavior.).

#### **3. Understand How to Configure Timestamp Assignment**

A key of a sourcetype is to apply [timestamp assignment configurations](https://docs.splunk.com/Documentation/Splunk/latest/Data/HowSplunkextractstimestamps) which control how Splunk identifies, extracts and assigns timestamps to events. Proper timestamp assignment ensures accurate event filtering and correlation, and correct enforcement of retention policies.

**Example:**
```ini
TIME_PREFIX = ^  # The timestamp starts at the beginning of each log record.
TIME_FORMAT = %Y-%m-%dT%H:%M:%S.%6QZ  # ISO 8601 format with microseconds.
MAX_TIMESTAMP_LOOKAHEAD = 27  # The timestamp length is up to 27 characters.
```

#### **4. Create the Sourcetype(s)**

The process for how a sourcetype is created depends on if you are running Splunk Enterprise or Splunk Cloud.

For Splunk Enterpise, create the sourcetype(s) via "Splunk Add-On Builder". A step by step guide can be found [here](https://docs.splunk.com/Documentation/AddonBuilder/latest/UserGuide/Overview).

For Splunk Cloud, create sourcetype directly in the Splunk Web. A step by step guide can be found [here](https://docs.splunk.com/Documentation/SplunkCloud/9.3.2408/Data/Managesourcetypes#Add_Source_Type:~:text=in%20Metrics.-,Add%20a%20source%20type,-To%20create%20a).

---

#### **5. Validate and Test Sourcetypes**

After creating the sourcetype, always **test it before deploying it to production**. One way to do this is to use the "Add Data" feature in Splunk Web.

Navigate to "Settings" > "Add Data"
Click on "Upload"
Click on "Select File"


✅ **Use the Add Data feature** in Splunk Web to preview how logs are parsed.  
✅ **Check event breaking** by running sample searches (`index=my_index sourcetype=my_custom_sourcetype`).  
✅ **Verify timestamps** by ensuring events appear in the correct order.  
✅ **Monitor performance** and adjust configurations if needed.  

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
        


