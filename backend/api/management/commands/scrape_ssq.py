import re
import urllib.request
from datetime import datetime

from django.core.management.base import BaseCommand

from api.models import LotteryResult


class Command(BaseCommand):
    help = "Scrape Double Color Ball history data from 500.com using standard library"

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting to scrape SSQ data...")

        url = "http://datachart.500.com/ssq/history/newinc/history.php?start=03001&end=99999&limit=100000"

        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req) as response:
                html = response.read().decode("utf-8")

            self.stdout.write(f"Successfully fetched data. HTML length: {len(html)}")

            # Find the table body content
            # The table rows usually have class "t_tr1"
            # Regex to find rows: <tr class="t_tr1">...</tr>
            # Use DOTALL to match newlines
            pattern = re.compile(r'<tr class="t_tr1">(.*?)</tr>', re.DOTALL)
            rows = pattern.findall(html)

            self.stdout.write(f"Found {len(rows)} records")

            created_count = 0
            updated_count = 0

            for row_html in rows:
                # Extract columns
                # <td>content</td>
                col_pattern = re.compile(r"<td.*?>(.*?)</td>", re.DOTALL)
                cols = col_pattern.findall(row_html)

                # Clean up columns (remove tags if any, strip whitespace)
                cols = [re.sub(r"<.*?>", "", c).strip() for c in cols]

                if len(cols) < 15:
                    continue

                try:
                    # Extract data based on observed structure:
                    # 0: Index, 1: Issue, 2-7: Red, 8: Blue, 9: Happy Sunday/Other,
                    # 10: Prize Pool, 11-14: Prizes, 15: Sales, 16: Date

                    # Index 1: Issue Number
                    issue_number = cols[1]

                    # Index 2-7: Red Balls
                    red_balls = [int(cols[i]) for i in range(2, 8)]

                    # Index 8: Blue Ball
                    blue_ball = int(cols[8])

                    # Index 10: Prize Pool (remove commas)
                    # Sometimes prize pool might be empty or in a different column if structure varies,
                    # but based on debug it seems to be at 10.
                    # Handle case where column might not exist or be empty
                    if len(cols) > 10:
                        prize_pool_str = cols[10].replace(",", "")
                        prize_pool = int(prize_pool_str) if prize_pool_str.isdigit() else 0
                    else:
                        prize_pool = 0

                    # Index 16: Date (last column usually)
                    # Use -1 to be safe if it's the last column
                    draw_date_str = cols[-1]
                    try:
                        draw_date = datetime.strptime(draw_date_str, "%Y-%m-%d").date()
                    except ValueError:
                        # Try to find date in other columns if -1 fails
                        found_date = False
                        for col in reversed(cols):
                            try:
                                draw_date = datetime.strptime(col, "%Y-%m-%d").date()
                                found_date = True
                                break
                            except ValueError:
                                continue

                        if not found_date:
                            self.stdout.write(
                                self.style.WARNING(f"Invalid date format for issue {issue_number}: {draw_date_str}")
                            )
                            continue

                    # Save to database
                    obj, created = LotteryResult.objects.update_or_create(
                        issue_number=issue_number,
                        defaults={
                            "draw_date": draw_date,
                            "red_balls": red_balls,
                            "blue_ball": blue_ball,
                            "prize_pool": prize_pool,
                        },
                    )

                    if created:
                        created_count += 1
                    else:
                        updated_count += 1

                    if (created_count + updated_count) % 100 == 0:
                        self.stdout.write(f"Processed {created_count + updated_count} records...")

                except Exception as e:
                    self.stdout.write(
                        self.style.WARNING(
                            f"Error processing issue {issue_number if 'issue_number' in locals() else 'unknown'}: "
                            f"{str(e)}"
                        )
                    )
                    continue

            self.stdout.write(self.style.SUCCESS(f"Finished! Created: {created_count}, Updated: {updated_count}"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"An error occurred: {str(e)}"))
