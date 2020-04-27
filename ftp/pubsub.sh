
RO="roles/editor"

# service account email
SA="serviceAccount:sensorgcpupload@fid-sql.iam.gserviceaccount.com"

# project 
P='fid-sql'

# ack deadline
AD=420

# topics
TPA='sensor-data-nl-tp'
TDA='sensor-data-nl-td'

# subscriptions
TPR='sensor-data-nl-tp'
TDR='sensor-data-nl-td'

# message duration
MD="60m"
TMD="10m"

# make sure we're on the right project
gcloud config set project fid-sql

# tidy up and remake the things
gcloud pubsub subscriptions delete projects/$P/subscriptions/$TPR
gcloud pubsub subscriptions delete projects/$P/subscriptions/$TDR
gcloud pubsub topics delete projects/$P/topics/$TPA
gcloud pubsub topics delete projects/$P/topics/$TDA

gcloud pubsub topics create $TPA
gcloud pubsub topics create $TDA

gcloud pubsub topics add-iam-policy-binding $TPA --member="$SA" --role=$RO
gcloud pubsub topics add-iam-policy-binding $TDA --member="$SA" --role=$RO

gcloud pubsub subscriptions create $TPR --topic=projects/$P/topics/$TPA --ack-deadline=$AD --expiration-period=never --message-retention-duration=$MD
gcloud pubsub subscriptions add-iam-policy-binding $TPR --member="$SA" --role="$RO"

gcloud pubsub subscriptions create $TDR --topic=projects/$P/topics/$TDA --ack-deadline=$AD --expiration-period=never --message-retention-duration=$MD
gcloud pubsub subscriptions add-iam-policy-binding $TDR --member="$SA" --role="$RO"
