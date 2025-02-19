#!/bin/bash

# Prompt user for VENDOR
read -p "Enter the name of the vendor and product that this add-on should relate to (for example, Cambio COSMIC): " VENDOR_AND_PRODUCT

read -p "Enter a description that explains the role of this add-on: " ADDON_DESCRIPTION
   

# Replace spaces with hyphens and convert to lowercase for ADDON_ID
VENDOR_FORMATTED_ID="$(echo "$VENDOR_AND_PRODUCT" | sed -E 's/[[:space:]]+/-/g' | tr '[:upper:]' '[:lower:]')"

# Set dependent variables
ADDON_ID="TA-$VENDOR_FORMATTED_ID"
ADDON_LABEL="Technical Add-on (TA) for $VENDOR_AND_PRODUCT"

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
description = $ADDON_DESCRIPTION
version = 1.0.0

[ui]
is_visible = false #the add-on will not be visible in Splunk Web
label = $ADDON_LABEL

[package]
id = $ADDON_ID
EOF

# Create metadata/default.meta (Permissions)
mkdir -p "$ADDON_ID/metadata"
cat <<EOF > "$ADDON_ID/metadata/default.meta"
[]
access = read : [ * ], write : [ admin, power ]
export = system
EOF

echo "✅ Splunk Technical Add-on ($ADDON_ID) created successfully!"
