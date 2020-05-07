kubectl get pods -l app=ftptd -o yaml | grep podIP | $(sed -E -e 's/[^:]+:\s+/kubectl exec -ti dnsutils -- ping /')
