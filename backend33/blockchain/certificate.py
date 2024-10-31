import os
import time
import shutil
from html2image import Html2Image


def html_to_image(html_string, output_file):
    try:
        # Attempt to initialize Html2Image with the specified browser
        hti = Html2Image(browser_executable='/usr/bin/chromium-browser')
    except Exception as e:
        print(f"Error initializing Html2Image with specified browser: {e}")
        hti = Html2Image()  # Fallback to default initialization

    try:
        # Take the screenshot and save it to the specified output file
        result = hti.screenshot(html_str=html_string, save_as=output_file, size=(1500, 830))
        print('Screenshot saved:', result)
    except Exception as e:
        print(f"Error taking screenshot: {e}")
        return None

    return output_file  # Return the output file path


def create_certificate(real_percentage, fake_percentage, file_hash, issued_for, collection_id, date):
    certificate_uid = f"{invoke_uid()}.png"
    certificate_html = html_parser(real_percentage, fake_percentage, file_hash, issued_for, collection_id, date)

    print("Generated HTML for certificate:")
    print(certificate_html)

    output_path = html_to_image(certificate_html, certificate_uid)

    if output_path is None:
        print("Failed to generate certificate image.")
        return None

    # Pause to ensure the image is written before moving
    time.sleep(2)

    # Move the certificate to the desired directory
    destination_path = os.path.join('certificates', certificate_uid)
    try:
        shutil.move(output_path, destination_path)
        print(f"Certificate moved to {destination_path}")
    except Exception as e:
        print(f"Error moving certificate: {e}")
        return None

    return certificate_uid
