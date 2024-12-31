# Base image: using Alpine Linux to reduce attack surface and improve performance
FROM alpine:3.18

# Keep project authorship documented for traceability
LABEL maintainer="andre_ataide@proton.me"

# Environment variables to control settings and facilitate future maintenance
ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    PYTHONUNBUFFERD=1 \
    BEARER_VERSION=2.6.0 \
    TERRAFORM_VERSION=1.6.0 \
    ANSIBLE_VERSION=8.0.0 \
    PROMETHEUS_VERSION=2.47.0

# Updating packages and installing essential tools
# `apk add` is used in Alpine to manage packages. We have chosen the following:
# - curl: for interactions with APIs.
# - bash: for better scripting compatibility.
# - python3 and py3-pip: base for SAST tools and automation.
# - git: for versioning and integration with pipelines.
RUN apk update && apk add --no-cache \
    bash \
    curl \
    python3 \
    py3-pip \
    git \
    openjdk11 \
    jq \
    libc6-compat \
    tini \
    && python3 -m ensurepip \
    && pip install --no-cache-dir --upgrade pip setuptools wheel

# Bearer install
RUN curl -L https://github.com/Bearer/bearer/releases/download/v${BEARER_VERSION}/bearer_${BEARER_VERSION}_linux_amd64.tar.gz | tar xz -C /usr/local/bin \
    && chmod +x /usr/local/bin/bearer

# OWASP ZAP configuration
RUN curl -sSL https://github.com/zaproxy/zaproxy/releases/latest/download/ZAP_2_13_0_Linux.tar.gz | tar -xzf - -C /opt \
    && ln -s /opt/ZAP_2_13_0/zap.sh /usr/bin/zap

# Instalar Terraform
RUN curl -L https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip -o /tmp/terraform.zip \
    && unzip /tmp/terraform.zip -d /usr/local/bin \
    && rm /tmp/terraform.zip 

# Instalar Ansible
RUN pip install ansible==${ANSIBLE_VERSION}

# Instalar Prometheus
RUN curl -L https://github.com/prometheus/prometheus/releases/download/v${PROMETHEUS_VERSION}/prometheus-${PROMETHEUS_VERSION}.linux-amd64.tar.gz | tar xz -C /opt \
    && ln -s /opt/prometheus-${PROMETHEUS_VERSION}.linux-amd64/prometheus /usr/local/bin/prometheus


# Logs directory
RUN mkdir -p /app /logs

# Working directories and Users
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
    && chown -R appuser:appgroup /app

# Health Check Script
COPY healthcheck.sh /usr/local/bin/healthcheck.sh
RUN chmod +x /usr/local/bin/healthcheck.sh
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s CMD ["healthcheck.sh"]

# Exposed port for DAST
EXPOSE 8080 9090

# More secure entrypoint
ENTRYPOINT ["/sbin/tini", "--"]

# Setting up logs and running standard scripts
CMD [ "/bin/bash" ]