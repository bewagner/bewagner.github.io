import sys
from pathlib import Path

if len(sys.argv) != 2:
    print("The number of argument (%d) was incorrect. Did you forget to specify the input file?" % len(sys.argc))
    sys.exit()


input_file_path = Path(sys.argv[1])

if not input_file_path.exists():
    print("The specified file does not exists.")
    sys.exit()

with open(sys.argv[1],"a+") as file:
    file.seek(0)
    input_file_content = file.read()
    file.truncate()

    replacements = {
        '爲':'為',
        '．':'。',
        '裏':'裡',
        '着':'著'
        }

    for wrong, correct in replacements.items():
        input_file_content = input_file_content.replace(wrong, correct)
    file.write(input_file_content)
    print("Characters converted.")
