## **Ingest Journal Audit Logs into Splunk**

Splunk can collect, index, search, correlate, and visualize logs from any system and any vendor that records activities such as **create, read, update, delete, and export** related to patient journals.

When onboarding logs from a new system, it is crucial to provide Splunk with proper configurations to ensure that logs are correctly parsed and indexed. This process is referred to as **index-time processing**, which occurs between the moment that Splunk initiates parsing of the logs until they finally are indexed and written to disk as individual events - where each event represents something that happened at a specific point in time.

To manage the diversity of log formats, Splunk typically assigns each log format a unique **sourcetype**, allowing index-time processing to be tailored accordingly.

### **What is a Sourcetype?**

A sourcetype instructs Splunk how to perform index-time processing, specifically by determining:

- How log records are separated into individual events
- How the timestamp is identified, extracted and assigned to each individual event

### **Define and Create Sourcetype(s)**

#### **1. Understand the Log Format(s)**

The first step is to understand the format of each individual log source, specifically:

- ❓ Structured (csv, json, xml), unstructured (free-text), or semi-structured
- ❓ Single-Line or Multi-Line
- ❓ Log delimiter (that is, what indicates the start and end of a log record)
- ❓ Log timestamp format

Rule of thumb: 
- Two log sources (for example, F_IX_ACCESS.txt and F_IX_ACTIVITY.txt) from the same system (for example, Cambio Cosmic) have different formats → Assign each log source a unique sourcetype.
- Two log sources from the same system have the same format → Assign both log sources the same sourcetype.
- Two log sources from different systems have the same format → Assign each log source a unique sourcetype.

#### **2. Define How the Sourcetype(s) Should Do Event Line-Breaking**

[Event line-breaking](https://docs.splunk.com/Documentation/Splunk/latest/Data/Configureeventlinebreaking) determines how Splunk processes raw data and breaks it into individual events, ensuring that every complete log record is indexed as a separate event.

A full list of configurations for event line-breaking with detailed explanations can be found [here](https://docs.splunk.com/Documentation/Splunk/latest/Data/Configureeventlinebreaking#:~:text=Line%20breaking%20general,affect%20line%20breaking.). 
In many cases, the default settings are sufficient, so it’s recommended to test them first. If they don't do the job, then consider adjusting the key settings (part of what is known as the ‘Magic 8’):

- `LINE_BREAKER` → Specifies a regex that determines how Splunk breaks raw text into lines. The regex must contain a capturing group, and wherever the regex matches, Splunk considers the start of the first capturing group to be the end of the previous line, and considers the end of the first capturing group to be the start of the next line. The portion of the text matched by the capturing group is excluded from the lines. Whether lines are directly processed as individual event depends on if Splunk is instructed to try to merge lines or not (see SHOULD_LINEMERGE setting).
- `SHOULD_LINEMERGE` → Determines whether Splunk should try to merge multiple lines into to a single event based on specific patterns. If set to false, each individual line will processed as a single event. If set to true, default behavior is that Splunk will create a new event if a new line with a timestamp is encountered. Splunk encourages disabling line merging if you can do with just LINE_BREAKER, as it results in improved performance.
- `TRUNCATE` → Determines the maximum size of an event, in bytes. This prevents Splunk from indexing abnormally large events that can have negative impact on performance.

For example, to properly apply event line-breaking on unstructured single-line logs delimited by a single \n character:  
```ini
LINE_BREAKER = ([\r\n]+)  # This is a default setting - breaks raw data into lines whenever one or more newlines are identified.
SHOULD_LINEMERGE = false # Because we are dealing with single line log records only, line merging can be disabled.
TRUNCATE = 10000 # An event cannot exceed 10,000 bytes in size. 
```

#### **3. Define How the Sourcetype Should Do Event Timestamp Assignment**

[Event timestamp assignment](https://docs.splunk.com/Documentation/Splunk/latest/Data/HowSplunkextractstimestamps) determines how Splunk identifies, extracts, and assigns a timestamp to each individual events.

A full list of configurations for event timestamp assignment with detailed explanations can be found [here](https://docs.splunk.com/Documentation/Splunk/9.4.0/Data/Configuretimestamprecognition#:~:text=of%20these%20settings.-,Timestamp%20settings,The%20following%20timestamp%20configuration%20settings%20are%20available%3A,-Setting). However, those included in what is known as the "Magic 8" configurations are:
- `TIME_PREFIX` → A regular expression that identifies where the timestamp begins in an event. The timestamp is expected to follow immediately after the match
- `TIME_FORMAT` → Defines the expected timestamp format using a strftime-style pattern.
- `MAX_TIMESTAMP_LOOKAHEAD` → Specifies how many characters Splunk should scan after TIME_PREFIX to extract the timestamp.

For example, to properly apply event timestamp assignment on unstructured single-line logs with timestamps in ISO 8601 format (including microseconds):
```ini
TIME_PREFIX = ^  # Regular expression indicating that the timestamp is located at the beginning of each log record.
TIME_FORMAT = %Y-%m-%dT%H:%M:%S.%6QZ  # Strptime indicating that the timestamp format follow ISO 8601 with microseconds.
MAX_TIMESTAMP_LOOKAHEAD = 27  # Indicating that the timestamp length is up to 27 characters.
```

#### **4. Validate event line-breaking and event timestamp assignment**

Best practice is to run tests to validate event line-breaking and event timestamp assignment before applying it to production data. This is typically done in a separate Splunk environment dedicated to testing, but it can also be done via the "Add Data" wizard in Splunk Web
1. Navigate to **Settings → Add Data** in Splunk Web.
2. Click **Upload**.
3. Click **Select File** and select a sample log file.
4. Enter **event event line-breaking** configurations.
5. Enter **event timestamp assignment** configurations.
6. Validate.

#### **4. Create the Sourcetype(s)**

Begin by creating a Splunk app to house all necessary configurations for ingesting the desired log sources. This app can then be deployed across various components of your Splunk environment, ensuring that the appropriate configurations are applied where needed.

To create a Splunk app that follows a structure that Splunk can understand, do the following: 



##### **For Splunk Cloud and Splunk Enterprise ([Single Server](https://docs.splunk.com/Documentation/Splunk/latest/Deploy/Distributedoverview#:~:text=In%20single%2Dinstance%20deployments%2C%20one%20instance%20of%20Splunk%20Enterprise%20handles%20all%20aspects%20of%20processing%20data%2C%20from%20input%20through%20indexing%20to%20search.%20A%20single%2Dinstance%20deployment%20can%20be%20useful%20for%20testing%20and%20evaluation%20purposes%20and%20might%20serve%20the%20needs%20of%20department%2Dsized%20environments.))**
- Create a respository (that is, a Splunk App) where each sourcetype should be stored.
  - Navigate to **Apps → Manage Apps** in Splunk Web.
  - Click on **Create App**.
  - In the field **Name**, enter 'TA-patient-privacy'.
  - In the field **Folder Name**, enter 'TA-patient-privacy'.
  - In the field **Visible**, select 'No'
- Create the sourcetype(s).
  - Navigate to **Settings → Source Types** in Splunk Web.
  - Click **New Source Type**.
  - In the **Name** field, enter the name.
    - sourcetype names typically follow the format [\<vendor\>\:\<product\>:\<logCategory\>](https://docs.splunk.com/Documentation/AddOns/released/Overview/Sourcetypes?_gl=1*1ihn43k*_gcl_aw*R0NMLjE3MzY4NDU0MzMuQ2owS0NRaUFzNWk4QmhEbUFSSXNBR0U0eEh6cjhjclZaVG5CRjlzVVA2cEY4dFRjcGhUeUpsZUIzeVBYTWd2eUpSdVF5cHdtcUNYdnc3WWFBc2dRRUFMd193Y0I.*_gcl_au*MTIzNTEwMDQ2Ni4xNzMzMTI2NzQ3*FPAU*MTIzNTEwMDQ2Ni4xNzMzMTI2NzQ3*_ga*Mjg4NjYwNTkwLjE3MjUzNDU3NTA.*_ga_5EPM2P39FV*MTczODkzNTM0MS40NDAuMS4xNzM4OTM1NjYwLjAuMC40MTMwNzc2ODA.*_fplc*MUlEblIzNWlEZ1RieHdjRWhzekY3Snk3VnRza3FPdHNMQ1RPTmJVTWpEUFpHQ3d6dkJxJTJGZ3E2JTJGUjF4THhXQjlSQXJLaGlVbTAxQkx2RkxSekVmSE5zWk5ZdzdDOGdNaWtaUlJacHdSaUx2WjhBUTJZblJTdW1lZ0lXUTNpZyUzRCUzRA..#:~:text=Source%20type%20names,the%20vendor%2C%20OSSEC.)
      - example: cambio:cosmic:access
      - example: cambio:cosmic:activity
  - In the **Destination App**, select the app 'TA-patient-privacy'.
  - Click on **Event Breaks** and enter event line-breaking configurations
  - Click on **Advanced** and enter timestamp assignment configurations
  - Click **Save**.

##### **For Splunk Enterprise ([Distributed Deployment](https://docs.splunk.com/Documentation/Splunk/latest/Deploy/Distributedoverview#:~:text=To%20support%20larger,across%20the%20data.))**
If you are running a **distributed deployment**, sourcetypes must be defined in a Splunk app located on the [Manager Node](https://docs.splunk.com/Splexicon:Managernode) in the [indexer cluster](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/Aboutclusters#:~:text=An%20indexer%20cluster%20is,set%20of%20peer%20nodes.). This ensures that all sourcetypes can be created, managed and deployed from a central point to all peer nodes belonging to the cluster.

Run the following commands to
1. create a Splunk app,
2. then create the local/ directory inside the app, and
3. finally create a props.conf configuration file in that directory
```bash
$SPLUNK_HOME/bin/splunk new app TA-patient-privacy 
mkdir -p $SPLUNK_HOME/etc/apps/TA_patient_privacy/local/
nano $SPLUNK_HOME/etc/apps/TA_patient_privacy/local/props.conf
```
Add a stanza for each unique sourcetype inside [`props.conf`](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Propsconf). 

Example:
```ini
[<sourceTypeName>] 
LINE_BREAKER = (\n+)
TIME_PREFIX = ^
TIME_FORMAT = %Y-%m-%dT%H:%M:%S.%6QZ
MAX_TIMESTAMP_LOOKAHEAD = 27
```

Then, instruct the Manager Node to deploy the Splunk app to the peer nodes in the cluster by following the steps described [here](https://docs.splunk.com/Documentation/Splunk/9.4.0/Indexer/Updatepeerconfigurations#:~:text=Admin%20Manual.-,Distribute%20the%20configuration%20bundle,the%20peers.%20This%20overwrites%20the%20contents%20of%20the%20peers%27%20current%20bundle.,-1.%20Prepare%20the).

### **Assign the Right Sourcetype to the Right Log Source(s)**

How a sourcetype is assigned depends on how the log source(s) is collected, which is determined by how the system generates and allows access to logs.

| **Access Type**   | **Collection Method**                               | **Destination**                |
|----------------------|------------------------------------------------|---------------------------------|
| **Text files** (`.log`, `.txt`, `.csv`, `.json`, `.xml`) | [Splunk Universal Forwarder (UF)](https://docs.splunk.com/Documentation/Forwarder/latest/Forwarder/Abouttheuniversalforwarder) | **Splunk Enterprise/Cloud** | 
| **API** (HTTP event forwarding) | [Splunk HTTP Event Collector (HEC)](https://docs.splunk.com/Documentation/Splunk/latest/Data/UsetheHTTPEventCollector) | **Splunk Enterprise/Cloud** | 
| **API** (REST API polling) | [Splunk Heavy Forwarder (HF)](https://docs.splunk.com/Documentation/Splunk/latest/Forwarding/Deployaheavyforwarder) | **Splunk Enterprise/Cloud** | 
| **Database tables**  | [Splunk Heavy Forwarder (HF)](https://docs.splunk.com/Documentation/Splunk/latest/Forwarding/Deployaheavyforwarder) | **Splunk Enterprise/Cloud** | 

A common scenario is that the system you want to collect logs from supports writing logs different text files which subsequently can collected by a [Splunk UF](https://docs.splunk.com/Documentation/Forwarder/latest/Forwarder/Abouttheuniversalforwarder) and sent to Splunk Enterprise/Cloud.

On each individual Splunk UF, there should exist a configuration file called [inputs.conf](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Inputsconf) that instructs what log source(s) to collect and how. 

In [inputs.conf](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Inputsconf), you define a monitor stanza that instructs the Splunk UF what path to collect logs from — whether a specific file or directory. The UF continuously monitors the specified path, ingesting new log records as they are written. Within the stanza, you also specify the sourcetype to assign to the log source(s) and the index where it should be stored. Then when Splunk Enterprise/Cloud receives the logs, it will know how to properly handle it.

Example monitor stanza:
```ini
[monitor://<path>]
index = <indexName>
sourcetype = <sourceTypeName>
whitelist = <regular expression>
whitelist = <regular expression>
```

---
---


## **Normalization of Journal Audit Logs**

### Fields 

### **Event types**

<p align="center">
  <img src="images/eventtypes_v1.8.png" alt="eventtypes" style="width:80%;">
</p>

Event types serve as a mean to categorize events in Splunk to easier make sense of them at scale. By defining a set of field-value pairs and search terms, you can identify a group of events and save the result as an event type which then can be references in a search (for example, eventtype=journalaudit:cosmic), simplifying searches and ensuring consistency. Since Splunk uses schema-on-read, event types can be easily modified and updated over time.

Since your organization likely has multiple systems that hold events that fall into to the same category, you will inevitably end up with multiple event types. In such cases, you can assign them a common tag. This allows you to retrieve all desired events in a single search by simply referencing a tag (for example, tag=journalaudit), without manually specifying each event type.

For the use cases in this repository, each system is expected to have **one unique event type** (that is, journalaudit:<systemName>). This event type must include events that records create/read/update/delete/export activities associated to patient journals. 

An event type can be created either through the Splunk UI (AKA Splunk Web) or Splunk configuration files - which approach you use depends on your preferences. The following is a step by step guide for how to create an event type in Splunk UI.

1. Navigate to **Settings > Event Types**
2. Click on **New Event Type**
3. In the field **Destination App**, select 'TA-patient-privacy'
4. In the **Name** field, enter a name for the event type.
   - This name should follow this format: journalaudit:vendor:product
   - example: journalaudit:cambio:cosmic
5. In the **Search string** field, enter the field::value pairs and search terms that captures the desired group of events from the system.
   - It's best practice to reference the index, host, source, and sourcetype fields associated with the system for performance reasons. These fields are mandatory across all events in Splunk and provides important metadata about for example where it originated, what kind of data it contains, and what index it is located in.
   - Depending on the system, additional field-value pairs and search terms may be necessary to narrow down the events to the desired group of events.
   - example: index=cosmic sourcetype IN ("cambio:cosmic:activity", "cambio:cosmic:access") source IN ("F_IX_ACTIVITY.txt", "F_IX_ACCESS") staff_ID=* patient_ID=* activity_type=*
6. In the **Tag(s)** field, enter the value 'journalaudit'
    - When creating an event type via Splunk Web and reference a tag that does not already exist, Splunk automatically creates that tag for you.

Make sure to adjust permissions to ensure that the appropriate roles in Splunk have read and/or write access to the right event types.
        


