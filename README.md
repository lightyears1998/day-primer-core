# phase-core

![Dependency](https://img.shields.io/david/lightyears1998/phase-core)
[![Build Status](https://travis-ci.com/lightyears1998/phase-core.svg?branch=master)](https://travis-ci.com/lightyears1998/phase-core)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/11f4f72b02f146d6a5292898b34ff425)](https://www.codacy.com/manual/lightyears1998/phase-core?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=lightyears1998/phase-core&amp;utm_campaign=Badge_Grade)

![Size](https://img.shields.io/bundlephobia/min/phase-core)
![Download](https://img.shields.io/npm/dw/phase-core)
![Start](https://img.shields.io/github/stars/lightyears1998/phase-core)

> 不要嘗試隱藏系統的複雜性，否則就會得到一個更複雜的系統。

## 同步算法

同步建立在“從不刪除項目”的基礎上。

1. 全量同步
2. 定位增量同步 根據`updateDate`二分搜索定位上服務器客戶端中`updateDate`不同的第一個項目。
3. 分支增量同步 類似於git中的分支合并算法。
