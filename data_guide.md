## **Onboarding logs**

Splunk can collect, index, search, correlate, and visualize logs from any system that records activities such as **create, read, update, delete, and export** activities related to patient journals.

When onboarding logs from a new system, it is crucial to provide Splunk with proper configurations to ensure that logs are correctly parsed and indexed. This process is referred to as **index-time processing**, which occurs between the moment that Splunk initiates parsing of the logs until they finally are indexed and written to disk. Finally on disk, each individual log record should be reflected as a **single event**, where each event represents something that happened at a specific point in time.

To handle this diversity of different log formats, Splunk assigns each log format an unique **sourcetype**, allowing index-time processing to be tailored accordingly.

Rule of thumb: 
- Two log sources from the same system with different formats → Assign each log source an unique sourcetype
- Two log sources from the same system have the same format → Assign both log sources the same sourcetype
- Two log sources from different systems have the same format → Assign each log source an unique sourcetype

### **What is a Sourcetype?**

A sourcetype instructs Splunk how to perform index-time processing, specifically be determining:

- **How logs are separated into individual events** 
- **How the timestamp is identified and extracted from individual event** 

### **Create Your Sourcetype(s)**

#### **1. Study the Log Format**

The first step is to understand the format of each individual log source, specifically:

- ❓ **Structured or Unstructured**
- ❓ **Single-Line or Multi-Line**
- ❓ **What signifies the start of a new log record**
- ❓ **Timestamp format**

#### **2. Event Line-Breaking**

The sourcetype applies [event line-breaking](https://docs.splunk.com/Documentation/Splunk/latest/Data/Configureeventlinebreaking) configurations which control how Splunk separates each individual log record into a single event. This prevents issues such as multiple log records being merged into a single event or a single log record split into multiple events.  

Example (unstructured single-line logs separated by a single \n character):  
```ini
LINE_BREAKER = ([\r\n]+)  # Ensures each log record is treated as a separate event by splitting at newlines.
```

For **multi-line logs**, specific configurations are required. See [Splunk Docs](https://docs.splunk.com/Documentation/SplunkCloud/latest/Data/Configureeventlinebreaking#:~:text=When%20you%20set%20SHOULD_LINEMERGE%20to%20the%20default%20of%20true%2C%20use%20these%20additional%20settings%20to%20define%20line%20breaking%20behavior.).

#### **3. Timestamp Assignment**

The sourcetype applies [timestamp assignment](https://docs.splunk.com/Documentation/Splunk/latest/Data/HowSplunkextractstimestamps) configurations which control how Splunk identifies, extracts, and assigns timestamps to events.

Example (unstructured single-line logs with timestamps in ISO 8601 format, including microseconds):
```ini
TIME_PREFIX = ^  # The timestamp starts at the beginning of each log record.
TIME_FORMAT = %Y-%m-%dT%H:%M:%S.%6QZ  # ISO 8601 format with microseconds.
MAX_TIMESTAMP_LOOKAHEAD = 27  # The timestamp length is up to 27 characters.
```

#### **4. Create the Sourcetype(s)**

##### **For Splunk Cloud and Splunk Enterprise ([Single Server Deployment](https://docs.splunk.com/Documentation/Splunk/latest/Deploy/Distributedoverview#:~:text=In%20single%2Dinstance%20deployments%2C%20one%20instance%20of%20Splunk%20Enterprise%20handles%20all%20aspects%20of%20processing%20data%2C%20from%20input%20through%20indexing%20to%20search.%20A%20single%2Dinstance%20deployment%20can%20be%20useful%20for%20testing%20and%20evaluation%20purposes%20and%20might%20serve%20the%20needs%20of%20department%2Dsized%20environments.))**
- Create a Splunk app where the sourcetype(s) should be located
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

##### **For Splunk Enterprise ([Distributed Deployment](https://docs.splunk.com/Documentation/Splunk/latest/Deploy/Distributedoverview#:~:text=To%20support%20larger,across%20the%20data.))**
If you are running a **distributed Splunk deployment**, sourcetypes must be created in a Splunk app located on the Manager Node in the indexer cluster. This ensures that all sourcetypes can be created, managed and deployed from a central point to all peer nodes belonging to the cluster.

Run the following commands to create a Splunk app, then create the local/ directory inside the app, and finally create a props.conf configuration file in that directory:
```bash
$SPLUNK_HOME/bin/splunk new app TA-patient-privacy 
mkdir -p $SPLUNK_HOME/etc/apps/TA_patient_privacy/local/
nano $SPLUNK_HOME/etc/apps/TA_patient_privacy/local/props.conf
```
Add a stanza for each unique sourcetype inside `props.conf`. 

Example:
```ini
[<uniqueSourceTypeName>]
LINE_BREAKER = (\n+)
TIME_PREFIX = ^
TIME_FORMAT = %Y-%m-%dT%H:%M:%S.%6QZ
MAX_TIMESTAMP_LOOKAHEAD = 27
```

Then, instruct the Manager Node to deploy the Splunk app to the peer nodes in the cluster by following the steps describe in [Splunk Docs](https://docs.splunk.com/Documentation/Splunk/9.4.0/Indexer/Updatepeerconfigurations#:~:text=Admin%20Manual.-,Distribute%20the%20configuration%20bundle,the%20peers.%20This%20overwrites%20the%20contents%20of%20the%20peers%27%20current%20bundle.,-1.%20Prepare%20the).

#### **5. Validate and Test Sourcetypes**

After creating the sourcetype, always **test it before deploying it to production**. One way to check that logs are successfully parsed into events is by using the **"Add Data"** wizard.

1. Navigate to **Settings → Add Data** in Splunk Web.
2. Click **Upload**
3. Click **Select File** and select a sample log file
4. Select a sourcetype
5. Validate **event line-breaking**
6. Validate **timestamp extraction**

❗ **If logs are not parsing correctly, adjust the sourcetype and repeat the test.**

### **Assign the Right Sourcetype to the Right Log Source**

How a sourcetype is assigned depends on how the log source(s) is collected, which is determined by how the system generates and allows access to logs.

| **Access Type**   | **Collection Method**                               | **Destination**                |
|----------------------|------------------------------------------------|---------------------------------|
| **Text files** (`.log`, `.txt`, `.csv`, `.json`, `.xml`) | [Splunk Universal Forwarder (UF)](https://docs.splunk.com/Documentation/Forwarder/latest/Forwarder/Abouttheuniversalforwarder) | **Splunk Enterprise/Cloud** | 
| **API** (HTTP event forwarding) | [Splunk HTTP Event Collector (HEC)](https://docs.splunk.com/Documentation/Splunk/latest/Data/UsetheHTTPEventCollector) | **Splunk Enterprise/Cloud** | 
| **API** (REST API polling) | [Splunk Heavy Forwarder (HF)](https://docs.splunk.com/Documentation/Splunk/latest/Forwarding/Deployaheavyforwarder) | **Splunk Enterprise/Cloud** | 
| **Database tables**  | [Splunk Heavy Forwarder (HF)](https://docs.splunk.com/Documentation/Splunk/latest/Forwarding/Deployaheavyforwarder) | **Splunk Enterprise/Cloud** | 

A likely scenario is that the system you want to collect logs from supports writing logs different text files which subsequently can collected by a [Splunk UF](https://docs.splunk.com/Documentation/Forwarder/latest/Forwarder/Abouttheuniversalforwarder) and sent to Splunk Enterprise/Cloud.

On each individual Splunk UF, there should exist a configuration file called [inputs.conf](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Inputsconf) that instructs what log source(s) to collect and how. 

In inputs.conf, you define a monitor stanza that instructs the Splunk UF where to collect logs from—whether a specific file or directory. The UF continuously monitors the specified path, ingesting new log records as they are written. Within the stanza, you also specify the sourcetype to assign to the log source and the index where the data should be stored (this information will be carried over to Splunk Enterprise/Cloud). As a rule of thumb, if different log sources require distinct sourcetypes or indexes, each should have its own dedicated monitor stanza.

Example monitor stanza:
```ini
[monitor://<path>]
index = <yourIndex>
sourcetype = <yourSourceType>
whitelist = <regular expression>
whitelist = <regular expression>
```

---
---


## **Fields**


## **Event types**

<p align="center">
  <img src="images/eventtypes_v1.8.png" alt="eventtypes" style="width:80%;">
</p>

Event types serve as a mean to categorize events in Splunk to easier make sense of them at scale. By defining field-value pairs and search terms, you can identify a group of events and save the result as an event type which then can be references in a search (for example, eventtype=journal_activity_cosmic), simplifying searches and ensuring consistency. Since Splunk uses schema-on-read, event types can be easily modified and updated over time.

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
        


