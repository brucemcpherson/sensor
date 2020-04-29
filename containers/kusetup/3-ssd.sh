echo "if a cluster re-init go and check if any persistent disks are hanging around"
kubectl apply -f ssd.yaml
kubectl get storageclasses