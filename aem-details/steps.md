docker build -t aem-test .

docker run --name AEM_AUTHOR_6.3 -p 4502:4502 -d aem-test