# coding=utf-8
import sys
from pathlib import Path

if len(sys.argv) != 2:
    print("The number of arguments ((input)%d!=2(correct)) was incorrect. Did you forget to specify the input file?" % len(sys.argv))
    sys.exit()


input_file_path = Path(sys.argv[1])

if not input_file_path.exists():
    print("The specified file does not exists.")
    sys.exit()

with open(sys.argv[1]) as file:
    input_file_content = file.read()


replacements = {
    '爲':'為',
    '．':'。',
    '裏':'裡',
    '着':'著'
    }

for wrong, correct in replacements.items():
    input_file_content = input_file_content.replace(wrong, correct)

with open(sys.argv[1], "w") as file:
    file.write(input_file_content)
    print("Characters converted.")
