#!/bin/bash

# Função para exibir mensagem de erro e sair
error_exit() {
    echo "$1"
    exit 1
}

# Verifica se Python está funcional
if ! command -v python3 &> /dev/null; then
    error_exit "Python3 não está instalado ou funcional!"
fi

# Verifica se o Bearer está instalado
if ! command -v bearer &> /dev/null; then
    error_exit "Bearer não está instalado ou funcional!"
fi

# Verifica se o OWASP ZAP está funcional
if ! command -v zap &> /dev/null; then
    error_exit "OWASP ZAP não está instalado ou funcional!"
fi

# Verifica se o Terraform está funcional
if ! command -v terraform &> /dev/null; then
    error_exit "Terraform não está instalado ou funcional!"
fi

# Verifica se o Ansible está funcional
if ! command -v ansible &> /dev/null; then
    error_exit "Ansible não está instalado ou funcional!"
fi

# Verifica se o Prometheus está funcional
if ! command -v prometheus &> /dev/null; then
    error_exit "Prometheus não está instalado ou funcional!"
fi

# Se todas as verificações passarem
echo "Health check OK"
exit 0