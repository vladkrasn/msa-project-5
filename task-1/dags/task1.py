from airflow import DAG
from airflow.providers.postgres.hooks.postgres import PostgresHook
from airflow.operators.python import PythonOperator, BranchPythonOperator
from airflow.operators.empty import EmptyOperator
from airflow.operators.email import EmailOperator
from datetime import datetime, timedelta
from airflow.utils.email import send_email

# Function that is called on failure
def send_error_email(context): 
    send_email(to=["myemail@emailprovider.com"], subject="An Error in pipeline!", html_content="An error occured!")


def get_data(**kwargs):
    hook = PostgresHook(postgres_conn_id="postgres-for-data")
    sql = "SELECT id FROM test;"
    records = hook.get_records(sql)
    ids = [row[0] for row in records]

    kwargs['ti'].xcom_push(key='ids', value=ids)


def check_for_alert(**kwargs):
    ids = kwargs['ti'].xcom_pull(task_ids="query_db", key="ids")
    if 2 in ids:
        return "send_email"
    return "no_alert"


with DAG(
    dag_id="test",
    start_date=datetime(2025, 7, 7),
    schedule='* * * * *',
    catchup=False,
    default_args={"owner": "airflow"},
) as dag:
    
    # Get rows and put them in a variable
    query_task = PythonOperator(
        task_id="query_db",
        python_callable=get_data,
        # Retry settings
        retry_delay=timedelta(minutes=1),
        retry_exponential_backoff=True,
        max_retry_delay=timedelta(minutes=2),
        #email_on_failure=True,
        on_failure_callback=send_error_email
    )

    # If row 2 is present, return send email, no alert otherwise
    branch_task = BranchPythonOperator(
        task_id="check_ids",
        python_callable=check_for_alert,
    )

    # Send email
    email_task = EmailOperator(
        task_id="send_email",
        to="myemail@emailprovider.com",
        subject="A row with Id 2 is found",
        html_content="Just what it says!",
    )

    # no alert
    no_alert = EmptyOperator(task_id="no_alert")

    query_task >> branch_task >> [email_task, no_alert]