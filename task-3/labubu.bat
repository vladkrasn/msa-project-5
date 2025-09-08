minikube start
kubectl apply -f cronjob.yaml
kubectl apply -f db.yaml
minikube image build -t data-exporter ./data-exporter
minikube dashboard