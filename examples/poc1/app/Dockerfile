# Base image: using Alpine Linux to reduce attack surface and improve performance
FROM alpine:3.18

# Keep project authorship documented for traceability
LABEL maintainer="andre_ataide@proton.me"

# Environment variables to control settings and facilitate future maintenance
ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    PYTHONUNBUFFERD=1 \
    ZAP_VERSION=2.15.0 \
    ZAP_CHECKSUM=6410e196baab458a9204e29aafb5745fca003a2a6c0386f2c6e5c04b67621fa7 \
    TERRAFORM_VERSION=1.6.0 \
    ANSIBLE_VERSION=8.0.0 \
    PROMETHEUS_VERSION=2.47.0

# Updating packages and installing essential tools [ok]
# `apk add` is used in Alpine to manage packages. We have chosen the following:
# - curl: for interactions with APIs.
# - bash: for better scripting compatibility.
# - python3 and py3-pip: base for SAST tools and automation.
# - git: for versioning and integration with pipelines.
RUN apk update && apk add --no-cache \
    bash \
    curl \
    ca-certificates \
    gcompat \
    python3 \
    py3-pip \
    git \
    openjdk11 \
    jq \
    libc6-compat \
    libstdc++ \
    libgcc \
    tini \
    && python3 -m ensurepip \
    && pip install --no-cache-dir --upgrade pip setuptools wheel \
    && apk add --no-cache --virtual=build-deps build-base \
    && apk add --no-cache dpkg dpkg-dev apt \
    && rm -rf /var/lib/apt/lists/*

# Use Bearer CLI Docker image to copy the binary [ok]
COPY --from=bearer/bearer:latest /usr/local/bin/bearer /usr/local/bin/bearer
RUN chmod +x /usr/local/bin/bearer

# OWASP ZAP Checkmarx configuration with checksum validation [OK]
RUN curl -sSL https://github.com/zaproxy/zaproxy/releases/download/v${ZAP_VERSION}/ZAP_${ZAP_VERSION}_Linux.tar.gz -o /tmp/zap.tar.gz \
    && echo "${ZAP_CHECKSUM}  /tmp/zap.tar.gz" | sha256sum -c - \
    && tar -xzf /tmp/zap.tar.gz -C /opt \
    && ln -s /opt/ZAP_${ZAP_VERSION}/zap.sh /usr/bin/zap \
    && rm /tmp/zap.tar.gz

# Terraform install with checksum validation
RUN apt-get install -y terraform \
    && rm -rf /var/lib/apt/lists/* \
    && grep "terraform_${TERRAFORM_VERSION}_linux_amd64.zip" /tmp/terraform.sha256 > /tmp/terraform.sha256sum \
    && sha256sum -c /tmp/terraform.sha256sum \
    && unzip /tmp/terraform.zip -d /usr/local/bin \
    && rm /tmp/terraform.zip /tmp/terraform.sha256 /tmp/terraform.sha256sum 

# Ansible install
RUN pip install ansible==${ANSIBLE_VERSION}

# Prometheus install
RUN curl -L https://github.com/prometheus/prometheus/releases/download/v${PROMETHEUS_VERSION}/prometheus-${PROMETHEUS_VERSION}.linux-amd64.tar.gz -o /tmp/prometheus.tar.gz \
    && tar xz -C /opt -f /tmp/prometheus.tar.gz \
    && ln -s /opt/prometheus-${PROMETHEUS_VERSION}.linux-amd64/prometheus /usr/local/bin/prometheus \
    && rm /tmp/prometheus.tar.gz

# Logs directory
RUN mkdir -p /app /logs
VOLUME /logs

# Working directories and Users
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
    && chown -R appuser:appgroup /app
USER appuser

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