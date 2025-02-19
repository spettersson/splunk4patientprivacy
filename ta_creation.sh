#!/bin/bash

# Prompt user for VENDOR and AUTHOR if not set
if [[ -z "$VENDOR" ]]; then
    read -p "Enter vendor name: " VENDOR
fi

if [[ -z "$AUTHOR" ]]; then
    read -p "Enter author name: " AUTHOR
fi

# Replace spaces with hyphens in ADDON_ID but keep spaces in DESCRIPTION
VENDOR_FORMATTED_ID="$(echo "$VENDOR" | sed 's/ /-/g')"

# Set dependent variables
ADDON_ID="TA-$VENDOR_FORMATTED_ID"
ADDON_DESCRIPTION_AND_LABEL="Technical Add-on (TA) for $VENDOR"

# Create Add-on Directory Structure
mkdir -p "$ADDON_ID"/{default,bin,metadata,static,lookups}
mkdir -p "$ADDON_ID/appserver/static"

# Ensure configuration files exist
touch "$ADDON_ID"/default/{props.conf,transforms.conf,eventtypes.conf,tags.conf}

# Create app.conf
cat <<EOF > "$ADDON_ID/default/app.conf"
[install]
is_configured = 1

[launcher]
author = "$AUTHOR"
description = "$ADDON_DESCRIPTION_AND_LABEL"
version = 1.0.0

[ui]
is_visible = false
label = "$ADDON_DESCRIPTION_AND_LABEL"

[package]
id = "$ADDON_ID"
EOF

# Create metadata/default.meta (Permissions)
mkdir -p "$ADDON_ID/metadata"
cat <<EOF > "$ADDON_ID/metadata/default.meta"
[]
access = read : [ * ], write : [ admin, power ]
export = system
EOF

echo "✅ Splunk Technical Add-on ($ADDON_ID) created successfully!"
