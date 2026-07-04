---
title: 'Clash 文献出版社直连规则'
date: 2021-12-08 13:20:21
tags: [soft]
---

# Clash 文献出版社直连规则
文献网站直接代理

Clash文献出版社直接代理规则
在校使用校园网浏览下载文献时，跳过这些出版社的网站代理
```yaml
- DOMAIN-SUFFIX,deepl.com,DIRECT
- DOMAIN-SUFFIX,manual.gromacs.org,DIRECT
- DOMAIN-KEYWORD,sci-hub,DIRECT
- DOMAIN-SUFFIX,ccdc.cam.ac.uk,DIRECT
- DOMAIN-KEYWORD,wiley,DIRECT
- DOMAIN-KEYWORD,pubs,DIRECT
- DOMAIN-KEYWORD,translate,DIRECT
- DOMAIN-KEYWORD,docs,DIRECT
- DOMAIN-KEYWORD,onenote,DIRECT
- DOMAIN-KEYWORD,office,DIRECT
- DOMAIN-KEYWORD,microsoft,DIRECT
- DOMAIN-SUFFIX,digicert.com,DIRECT
- DOMAIN-SUFFIX,sciencedirect.com,DIRECT
- DOMAIN-SUFFIX,iresearchbook.cn,DIRECT
- DOMAIN-SUFFIX,elsevier.com,DIRECT
- DOMAIN-SUFFIX,nature.com,DIRECT
- DOMAIN-SUFFIX,webofknowledge.com,DIRECT
- DOMAIN-SUFFIX,pubs.acs.org,DIRECT
- DOMAIN-SUFFIX,scitation.org,DIRECT
- DOMAIN-SUFFIX,tandfonline.com,DIRECT
```
配置文件预处理
```yaml
parsers: # array
  - url: https://www.v2board.uk/api/v1/client/subscribe?token=b546dd9b7f75a78e9f3cf8a423e9568b
    yaml:
      prepend-rules:
        - DOMAIN-SUFFIX,deepl.com,DIRECT
        - DOMAIN-SUFFIX,manual.gromacs.org,DIRECT
        - DOMAIN-KEYWORD,sci-hub,DIRECT
        - DOMAIN-SUFFIX,ccdc.cam.ac.uk,DIRECT
        - DOMAIN-KEYWORD,wiley,DIRECT
        - DOMAIN-KEYWORD,pubs,DIRECT
        - DOMAIN-KEYWORD,translate,DIRECT
        - DOMAIN-KEYWORD,docs,DIRECT
        - DOMAIN-KEYWORD,onenote,DIRECT
        - DOMAIN-KEYWORD,office,DIRECT
        - DOMAIN-KEYWORD,microsoft,DIRECT
        - DOMAIN-SUFFIX,digicert.com,DIRECT
        - DOMAIN-SUFFIX,sciencedirect.com,DIRECT
        - DOMAIN-SUFFIX,iresearchbook.cn,DIRECT
        - DOMAIN-SUFFIX,elsevier.com,DIRECT
        - DOMAIN-SUFFIX,nature.com,DIRECT
        - DOMAIN-SUFFIX,webofknowledge.com,DIRECT
        - DOMAIN-SUFFIX,pubs.acs.org,DIRECT
        - DOMAIN-SUFFIX,scitation.org,DIRECT
        - DOMAIN-SUFFIX,tandfonline.com,DIRECT
      commands:
        - dns.enable=false
        - dns.ipv6=true
```
