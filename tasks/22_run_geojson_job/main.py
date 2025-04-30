import subprocess

def run_property_tiles_job(request):
    try:
        result = subprocess.run(
            ["gcloud", "run", "jobs", "execute", "generate-property-tiles", "--region=us-east4"],
            capture_output=True, text=True, check=True
        )
        return f"Job executed successfully:\n{result.stdout}", 200
    except subprocess.CalledProcessError as e:
        return f"Job failed:\n{e.stderr}", 500