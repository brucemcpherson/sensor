# should be something like "consumetd"
D=$1
kubectl get pods | grep -Po  "^$D-[\w]+-[\w]+\s" | while read line; do kubectl logs $line ; done
echo "that was the logs for $D"