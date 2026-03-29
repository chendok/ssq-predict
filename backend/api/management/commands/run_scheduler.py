import logging

from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django_apscheduler import util
from django_apscheduler.jobstores import DjangoJobStore
from django_apscheduler.models import DjangoJobExecution

logger = logging.getLogger(__name__)


def scrape_ssq_job():
    logger.info("Executing scrape_ssq_job...")
    call_command("scrape_ssq")
    logger.info("scrape_ssq_job executed successfully.")


@util.close_old_connections
def delete_old_job_executions(max_age=604_800):
    """
    This job deletes APScheduler job execution entries older than `max_age` from the database.
    It helps to prevent the database from filling up with old historical records that are no longer
    useful.
    :param max_age: The maximum length of time to retain historical job execution records.
                    Defaults to 7 days.
    """
    DjangoJobExecution.objects.delete_old_job_executions(max_age)


class Command(BaseCommand):
    help = "Runs APScheduler."

    def handle(self, *args, **options):
        scheduler = BlockingScheduler(timezone=settings.TIME_ZONE)
        scheduler.add_jobstore(DjangoJobStore(), "default")

        # Run scrape_ssq every Tuesday, Thursday, and Sunday at 22:00
        scheduler.add_job(
            scrape_ssq_job,
            trigger=CronTrigger(day_of_week="tue,thu,sun", hour="22", minute="00"),
            id="scrape_ssq_job",
            max_instances=1,
            replace_existing=True,
        )
        logger.info("Added job 'scrape_ssq_job'.")
        self.stdout.write(self.style.SUCCESS("Added job 'scrape_ssq_job'."))

        scheduler.add_job(
            delete_old_job_executions,
            trigger=CronTrigger(
                day_of_week="mon", hour="00", minute="00"
            ),  # Midnight on Monday, before start of the next work week.
            id="delete_old_job_executions",
            max_instances=1,
            replace_existing=True,
        )
        logger.info("Added weekly job: 'delete_old_job_executions'.")
        self.stdout.write(self.style.SUCCESS("Added weekly job: 'delete_old_job_executions'."))

        try:
            logger.info("Starting scheduler...")
            self.stdout.write(self.style.SUCCESS("Starting scheduler..."))
            scheduler.start()
        except KeyboardInterrupt:
            logger.info("Stopping scheduler...")
            self.stdout.write(self.style.SUCCESS("Stopping scheduler..."))
            scheduler.shutdown()
            logger.info("Scheduler shut down successfully!")
            self.stdout.write(self.style.SUCCESS("Scheduler shut down successfully!"))
