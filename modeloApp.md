# 📱 Aplicativo para Medir a Densidade de Silagens com Sonda Cilíndrica

## 📌 Objetivo

Desenvolver um aplicativo capaz de calcular a **densidade de silagens (kg/m³)** a partir de amostras coletadas com uma **sonda cilíndrica**.

---

## 📏 Medições Realizadas

Durante a coleta, são obtidos os seguintes dados:

* 📐 **Comprimento (profundidade) da amostra**
* ⚖️ **Massa da amostra**

---

## 📚 Contextualização

* O **comprimento da amostra varia** a cada coleta
* O **diâmetro da sonda é fixo**, mas pode ser configurável no sistema
* A amostra coletada possui formato de **cilindro**

---

## ⚙️ Variáveis do Sistema

### 🔧 Configuráveis (via interface)

* Diâmetro da sonda (mm)

---

### ⌨️ Dados de Entrada

* Profundidade da amostra (cm)

  * Permitir até 1 casa decimal

* Massa da amostra (g)

  * Permitir até 1 casa decimal

---

### 📤 Dados de Saída

* Volume coletado (m³)
* Densidade (kg/m³)

  * Pode ser arredondada sem casas decimais

---

## 🧮 Base Matemática

### 1. Cálculo do raio

[
r = \frac{d}{2}
]

> Onde:
>
> * ( d ) = diâmetro da sonda (em cm)

---

### 2. Cálculo da área da seção da sonda

[
A = \pi \cdot r^2
]

> Resultado em **cm²**

---

### 3. Cálculo do volume da amostra

[
V = A \cdot h
]

> Onde:
>
> * ( h ) = profundidade (cm)
> * Resultado em **cm³**

---

### 4. Conversão de unidades

[
1 , m^3 = 1.000.000 , cm^3
]

[
V_{m³} = \frac{V_{cm³}}{1.000.000}
]

---

### 5. Conversão da massa

[
M_{kg} = \frac{M_{g}}{1000}
]

---

### 6. Cálculo da densidade

[
\rho = \frac{M}{V}
]

> Onde:
>
> * ( M ) = massa em kg
> * ( V ) = volume em m³

---

## 📊 Exemplos Reais (Base da Planilha)

### 🔹 Exemplo 1

* Diâmetro: 48 mm
* Raio: 2,4 cm
* Área: 18,0956 cm²
* Profundidade: 17 cm
* Massa: 240 g

**Resultados:**

* Volume: 0,000307625 m³
* Densidade: **780 kg/m³**

---

### 🔹 Exemplo 2

* Diâmetro: 48 mm
* Profundidade: 14 cm
* Massa: 79 g

**Resultados:**

* Volume: 0,000253338 m³
* Densidade: **312 kg/m³**

---

### 🔹 Exemplo 3 (Sonda diferente)

* Diâmetro: 50 mm
* Raio: 2,5 cm
* Área: 19,6349 cm²
* Profundidade: 14 cm
* Massa: 79 g

**Resultados:**

* Volume: 0,000274889 m³
* Densidade: **287 kg/m³**

---

## 🧠 Regras Importantes

* Sempre converter unidades corretamente:

  * mm → cm → m
  * g → kg
* A área da sonda deve ser recalculada apenas se o diâmetro mudar
* O sistema deve evitar divisão por zero
* Validar entradas (não permitir valores negativos ou zero)

---

## 💡 Lógica Geral do Sistema

1. Receber diâmetro da sonda
2. Calcular raio
3. Calcular área da sonda
4. Receber profundidade e massa
5. Calcular volume
6. Converter unidades
7. Calcular densidade
8. Exibir resultado

---

## 🚀 Inclusões

* Histórico de medições
* Exportação para PDF/Excel
* Gráficos de densidade
* Area de sobre qual lista o perfil do criador qual seja: Ozeias Meira Santos de Souza, nascido em 12/08/1998, especialista em arquitetura de sistema, foto está em ozeias.jpg
