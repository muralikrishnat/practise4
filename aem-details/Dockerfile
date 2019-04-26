FROM centos:7
MAINTAINER martinloeffler

RUN yum -y update
RUN yum -y install java-1.8.0-openjdk

# Copies required build media
ADD cq-author-p4502.jar /opt/cq/cq-author-4502.jar
ADD license.properties /opt/cq/license.properties

 # Extracts AEM
WORKDIR /opt/cq
RUN java -XX:MaxPermSize=256m -Xmx1024M -jar cq-author-4502.jar -unpack -r nosamplecontent

EXPOSE 4502
CMD crx-quickstart/bin/quickstart