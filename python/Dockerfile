FROM python:3
MAINTAINER Ricardo Roman <ricardo.roman@ticnsp.org>
RUN mkdir /app
WORKDIR /app
COPY ./requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt
COPY . /app
CMD ["python", "app.py"]
