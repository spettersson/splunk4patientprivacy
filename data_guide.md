## **Getting the logs into Splunk**

Splunk can collect, index, search, correlate, and visualize logs from any system that records activities such as **create, read, update, delete, and export** related to patient journals.

When onboarding logs from a new system, it is crucial to provide Splunk with proper configurations to ensure that logs are correctly parsed and indexed. This process is referred to as **index-time processing**, which occurs between the moment that Splunk initiates parsing of the logs until they finally are indexed and written to disk as events - where each event represents something that happened at a specific point in time.

To manage the diversity of log formats, Splunk typically assigns each log format a unique **sourcetype**, allowing index-time processing to be tailored accordingly.

### **What is a Sourcetype?**

A sourcetype instructs Splunk how to perform index-time processing, specifically by determining:

- How logs are separated into individual events
- How the timestamp is identified, extracted and assigned to each individual event

### **Define and Create Sourcetype(s)**

#### **1. Understand the Log Format(s)**

The first step is to understand the format of each individual log source, specifically:

- ❓ Structured or Unstructured
- ❓ Single-Line or Multi-Line
- ❓ What indicates the start of a new log record
- ❓ Log timestamp format

Rule of thumb: 
- Two log sources (for example, F_IX_ACCESS.txt and F_IX_ACTIVITY.txt) from the same system have different formats → Assign each log source a unique sourcetype.
- Two log sources from the same system have the same format → Assign both log sources the same sourcetype.
- Two log sources from different systems have the same format → Assign each log source a unique sourcetype.

#### **2. Define Event Line-Breaking**

The sourcetype applies [event line-breaking](https://docs.splunk.com/Documentation/Splunk/latest/Data/Configureeventlinebreaking) configurations which control how Splunk separates each individual log record into a single event. This prevents issues such as multiple log records being merged into a single event or a single log record split into multiple events. 

A full list of configurations for event line-breaking with detailed explanations can be found [here](https://docs.splunk.com/Documentation/Splunk/latest/Data/Configureeventlinebreaking#:~:text=Line%20breaking%20general,affect%20line%20breaking.). However, part of what is commonly referred to as the "Magic 8" configurations are `LINE_BREAKER`, `SHOULD_LINEMERGE`, and `TRUNCATE`. 

An example defined to handle unstructured single-line logs delimited by a single \n character:  
```ini
LINE_BREAKER = (\n+)  # Ensures each log record is treated as a separate event by splitting at each newline.
SHOULD_LINEMERGE = false # When set to false, Splunk will treat the result of LINE_BREAKER as individual events.
TRUNCATE = 10000 # The maximum length of an event, in bytes. Hinders Splunk from indexing very large events.
```

Best practices is to always test the configurations on sample logs before putting them into production. This can be done via the "Add Data" wizard in Splunk Web
1. Navigate to **Settings → Add Data** in Splunk Web.
2. Click **Upload**.
3. Click **Select File** and select a sample log file.
4. Enter **event line-breaking** configurations
5. Validate **event line-breaking**.


#### **3. Define Event Timestamp Assignment**

The sourcetype applies [event timestamp assignment](https://docs.splunk.com/Documentation/Splunk/latest/Data/HowSplunkextractstimestamps) configurations which control how Splunk identifies, extracts, and assigns a timestamp to each individual events.

A full list of configurations for event timestamp assignment with detailed explanations can be found [here](https://docs.splunk.com/Documentation/Splunk/9.4.0/Data/Configuretimestamprecognition#:~:text=of%20these%20settings.-,Timestamp%20settings,The%20following%20timestamp%20configuration%20settings%20are%20available%3A,-Setting). However, part of what is commonly referred to as the "Magic 8" configurations are `TIME_PREFIX`, `TIME_FORMAT`, and `MAX_TIMESTAMP_LOOKAHEAD`

An example defined to handle unstructured single-line logs with timestamps in ISO 8601 format (including microseconds):
```ini
TIME_PREFIX = ^  # Regular expression indicating that the timestamp is located at the beginning of each log record.
TIME_FORMAT = %Y-%m-%dT%H:%M:%S.%6QZ  # Strptime indicating that the timestamp format follow ISO 8601 with microseconds.
MAX_TIMESTAMP_LOOKAHEAD = 27  # Indicating that the timestamp length is up to 27 characters.
```

Best practices is to run tests to validate the configurations before putting them into production. This can be done via the "Add Data" wizard in Splunk Web
1. Navigate to **Settings → Add Data** in Splunk Web.
2. Click **Upload**.
3. Click **Select File** and select a sample log file.
4. Enter **event timestamp assignment** configurations
5. Validate **event timestamp assignment**.

#### **4. Create the Sourcetype(s)**

By now, you have defined and validated that each of your sourcetypes does proper index-time processing. The next step is to actually create the sourcetype(s).

##### **For Splunk Cloud and Splunk Enterprise ([Single Server Deployment](https://docs.splunk.com/Documentation/Splunk/latest/Deploy/Distributedoverview#:~:text=In%20single%2Dinstance%20deployments%2C%20one%20instance%20of%20Splunk%20Enterprise%20handles%20all%20aspects%20of%20processing%20data%2C%20from%20input%20through%20indexing%20to%20search.%20A%20single%2Dinstance%20deployment%20can%20be%20useful%20for%20testing%20and%20evaluation%20purposes%20and%20might%20serve%20the%20needs%20of%20department%2Dsized%20environments.))**
- Create a Splunk app where the sourcetype(s) should be located.
  - Navigate to **Apps → Manage Apps** in Splunk Web.
  - Click on **Create App**.
  - In the field **Name**, enter 'TA-patient-privacy'.
  - In the field **Folder Name**, enter 'TA-patient-privacy'.
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

Run the following commands to create a Splunk app, then create the local/ directory inside the app, and finally create a props.conf configuration file in that directory:
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


## **Fields**


## **Event types**

<p align="center">
  <img src="images/eventtypes_v1.8.png" alt="eventtypes" style="width:80%;">
</p>

Event types serve as a mean to categorize events in Splunk to easier make sense of them at scale. By defining field-value pairs and search terms, you can identify a group of events and save the result as an event type which then can be references in a search (for example, eventtype=journal:audit:cosmic), simplifying searches and ensuring consistency. Since Splunk uses schema-on-read, event types can be easily modified and updated over time.

Since your organization likely has multiple systems that hold events that fall into to the same event category, you will inevitably end up with multiple event types. In such cases, you can assign them a common tag. This allows you to retrieve all desired events in a single search by simply referencing a tag (for example, tag=journalaudit), without manually specifying each event type.

For the use cases in this repository, each system is expected to have **one unique event type** (that is, journalaudit:<systemName>). This event type must include events that records create/read/update/delete activities associated to patient journals. 

An event type can be created either through the Splunk UI (AKA Splunk Web) or Splunk configuration files - which approach you use depends on your preferences. The following is a step by step guide for how to create an event type in Splunk UI.

1. Navigate to **Settings > Event Types**
2. Click on **New Event Type**
3. In the **Name** field, enter a name for the event type.
   - This name should follow this format: journalaudit:<system>
   - example: journalaudit:cosmic
4. In the **Search string** field, enter the field::value pairs and search terms that captures the desired group of events from the system.
   - It's best practice to reference the index, host, source, and sourcetype fields associated with the system for performance reasons. These fields are mandatory across all events in Splunk and provides important metadata about for example where it originated, what kind of data it contains, and what index it is located in.
   - Depending on the system, additional field-value pairs and search terms may be necessary to narrow down the events to the desired group of events.
   - example: index=cosmic sourcetype IN ("cambio:cosmic:activity", "cambio:cosmic:access") source IN ("F_IX_ACTIVITY.txt", "F_IX_ACCESS") activity_type=*
5. In the **Tag(s)** field, enter the value 'journalaudit'
    - When creating an event type via Splunk Web and reference a tag that does not already exist, Splunk automatically creates that tag for you.

Make sure to adjust permissions to ensure that the appropriate roles in Splunk have read and/or write access to the right event types.
        


