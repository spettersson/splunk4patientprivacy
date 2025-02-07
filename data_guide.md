## **Get Logs In**

Splunk can collect, index, search, correlate, and visualize logs from any system or vendor that records activities such as **create, read, update, delete, and export** activities related to patient journals.

When onboarding logs from a new system, it is crucial to provide Splunk with proper configurations to ensure that logs are correctly parsed and indexed. This process is referred to as **index-time processing**, which occurs **between the moment logs are received by Splunk and when they are written to disk**. Once on disk, each individual log record should be reflected as a **single event**, where each event represents something that happened at a specific point in time.

However, **log formats vary significantly** between systems—or even between different sources within the same system. To handle this diversity, Splunk assigns each log format a **unique sourcetype**, allowing index-time processing to be tailored accordingly.

### **What is a Sourcetype?**

A **sourcetype** is a set of configurations that tells Splunk how to perform **index-time processing**. It mainly defines:

- **How logs are separated into individual events** (event line-breaking rules).
- **How timestamps are identified and extracted** (so events are placed in the correct time order).
- **How field extractions work** (so logs become structured and searchable).

### **Create Your Own Sourcetype(s)**

#### **1. Study the Log Format**

The first step is to understand the structure of your logs, specifically:

- ❓ **Structured vs. Unstructured**: JSON, XML, CSV, syslog, or free-text
- ❓ **Single-Line vs. Multi-Line**: Whether each indiviual log record are made up of a single line or multiple lines
- ❓ **Event Delimiter**: Defines the start of a new log record (e.g., `\n` for new lines, timestamps, or a specific keyword)
- ❓ **Timestamp Format**: The format of the timestamp in the log records that indicate when the log record was created (e.g., `2025-01-01T00:00:00.000000Z`, `2023-01-01 00:00:00.000`).

#### **2. Event Line-Breaking**

A key function of a sourcetype is to apply [event line-breaking](https://docs.splunk.com/Documentation/Splunk/latest/Data/Configureeventlinebreaking) configurations which control how Splunk determines event boundaries (that is, the start and end of an event). This prevents issues such as multiple log records merged into a single event or a single log record split into multiple events.  

Example (unstructured single-line logs separated by a single \n character):  
```ini
LINE_BREAKER = ([\r\n]+)  # Ensures each log record is treated as a separate event by splitting at newlines.
```

For **multi-line logs**, specific configurations are required. See [Splunk Docs](https://docs.splunk.com/Documentation/SplunkCloud/latest/Data/Configureeventlinebreaking#:~:text=When%20you%20set%20SHOULD_LINEMERGE%20to%20the%20default%20of%20true%2C%20use%20these%20additional%20settings%20to%20define%20line%20breaking%20behavior.).

#### **3. Timestamp Assignment**

A key function of a sourcetype is to apply [timestamp assignment](https://docs.splunk.com/Documentation/Splunk/latest/Data/HowSplunkextractstimestamps) configurations which control how Splunk identifies, extracts, and assigns timestamps to events.

Example (unstructured single-line logs with timestamps in ISO 8601 format, including microseconds):
```ini
TIME_PREFIX = ^  # The timestamp starts at the beginning of each log record.
TIME_FORMAT = %Y-%m-%dT%H:%M:%S.%6QZ  # ISO 8601 format with microseconds.
MAX_TIMESTAMP_LOOKAHEAD = 27  # The timestamp length is up to 27 characters.
```

✅ **Accurate event filtering and correlation**  
✅ **Correct retention policy enforcement**  

#### **4. Create the Sourcetype(s)**

##### **For Splunk Cloud and Splunk Enterprise (Single Server Deployment)**
- Create a new Splunk app where the sourcetype(s) should be located
  - Navigate to **Apps → Manage Apps** in Splunk Web
  - Click on **Create App**
  - In the field **Name**, enter 'TA-patient-privacy'
  - In the field **Folder Name**, enter 'TA-patient-privacy'
- Create the sourcetype(s)
  - Navigate to **Settings → Source Types** in Splunk Web
  - Click **New Source Type**.
  - In the **Name** field, enter the name \<systemName\>_\<logSource\> (each sourcetype must have a unique name; no two sourcetypes can share the same name.)
  - In the **Destination App**, select the app 'TA-patient-privacy'
  - Click on **Event Breaks** and define event line-breaking
  - Click on **Advanced** and define timestamp assignment
  - Click **Save**

##### **For Splunk Enterprise (Distributed Deployment)**
If you are running a **distributed Splunk deployment**, sourcetypes must be created in a Splunk app located on the Cluster Manager. This ensures that all sourcetypes are pushed out from a central point to all peer nodes belonging to the cluster.

Run the following commands to create a Splunk app, then create the local/ directory inside the app, and finally create a props.conf configuration file in that directory:
```bash
$SPLUNK_HOME/bin/splunk new app TA-patient-privacy 
mkdir -p $SPLUNK_HOME/etc/apps/TA_patient_privacy/local/
nano $SPLUNK_HOME/etc/apps/TA_patient_privacy/local/props.conf
```
Add a stanza for each unique sourcetype inside `props.conf`. 

Example:
```ini
[<enterSourceTypeName>]
LINE_BREAKER = (\n+)
TIME_PREFIX = ^
TIME_FORMAT = %Y-%m-%dT%H:%M:%S.%6QZ
MAX_TIMESTAMP_LOOKAHEAD = 27
```

Then, deploy the Splunk app by following the steps describe in [Splunk Docs](https://docs.splunk.com/Documentation/Splunk/9.4.0/Indexer/Updatepeerconfigurations#:~:text=Admin%20Manual.-,Distribute%20the%20configuration%20bundle,the%20peers.%20This%20overwrites%20the%20contents%20of%20the%20peers%27%20current%20bundle.,-1.%20Prepare%20the).

#### **5. Validate and Test Sourcetypes**

After creating the sourcetype, always **test it before deploying it to production**. One way to check that logs are successfully parsed into events is by using the **"Add Data"** wizard in Splunk Web.

1. Navigate to **Settings → Add Data**
2. Click **Upload**
3. Click **Select File** and select a sample log file
4. Select a sourcetype
5. Validate **event line-breaking**
6. Validate **timestamp extraction**

❗ **If logs are not parsing correctly, adjust the sourcetype and repeat the test.**

### **Assign the Right Log Source to the Right Sourcetype**

How a sourcetype is assigned depends on how the log source is collected, which depends on how the system allows logs to be captured. In many cases, the system can write logs to a set of text files in an as is format. 

for the log source in question. Typically if you have a system

---
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
        


