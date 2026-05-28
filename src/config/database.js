export let logsDatabase = []

export const PcsMap = {
  "::1": "01",  
  "192.168.1.50": "PC-01",
  "192.168.1.51": "PC-02",
  "192.168.1.52": "PC-03",
  "192.168.1.55": "PC-04",
  "192.168.1.101": "PC-Diretoria"
}

export const resetDatabase = () => {
  bancoDeDadosLogs = [];
}