def check_age(age):
    if age > 18:
        return "Minor"
    else:
        return "Major"

print(check_age(20))