gcloud container clusters get-credentials sensor --zone europe-west4-b
kubectl config get-contexts 
echo "check that nodes are for the correct project,cluster sensor and region  europe-west4-b"
kubectl get nodes