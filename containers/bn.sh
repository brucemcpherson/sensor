
echo "set the context to the project"
#need to run this from top of the project 

P="fid-sql"
Z="europe-west4-b"
C="sensor"

gcloud config set project $P
gcloud container clusters get-credentials $C --zone $Z
kubectl config get-contexts
echo "check that nodes are for the right project $P on $Z"
kubectl get nodes
