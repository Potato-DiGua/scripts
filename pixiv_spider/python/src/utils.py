def format_file_size(size: int) -> str:
    if size < 1024:
        return f"{size}B"
    elif size < 1024 * 1024:
        return f"{round(size / 1024, 2)}KB"
    else:
        return f"{round(size / (1024 * 1024), 2)}MB"


def percentage(value: float) -> str:
    return f"{int(value * 100)}%"


def get_name_from_url(url: str):
    index = url.rfind("/")
    if index > 0:
        return url[index + 1:]
    else:
        return ""
