D=$1
R=$2
echo "building $D and deploying $D$R"
echo "set the context to the project"
#need to run this from top of the project 
cd ~/sensor
NODE_ENV=production
P="fid-sql"
Z="europe-west4-b"
C="sensor"
echo "starting build $D"
docker build -f containers/$D.dockerfile . --tag gcr.io/$P/$D:$R
docker push gcr.io/$P/$D
echo "delete pods"
kubectl get pods | grep -Po  "^$D$R-[\w]+-[\w]+\s" | while read line; do kubectl delete pod $line ; done
kubectl get pods
kubectl get pods | grep -Po  "^$D$R-[\w]+-[\w]+\s" | while read line; do kubectl logs $line ; done
