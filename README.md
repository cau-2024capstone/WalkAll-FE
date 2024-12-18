# Walk-All


### 서비스 소개

**Walk-All**은 사용자와 함께 지도를 만들어나가는 산책어플입니다.
아래와 같은 특징을 통해 더욱 다양하고 맞춤형인 산책 경험을 제공합니다.

1. **맞춤형 코스 추천**  
   - 사용자가 직접 출발지, 경유지, 도착지를 지도 위에서 선택할 수 있습니다.  
   - 골목길, 편한 길 등 다양한 산책 유형 중 원하는 타입을 선택할 수 있습니다.  
   - 시간, 거리 등 사용자의 목표를 설정하고, 이에 맞는 최적의 산책 코스를 추천받을 수 있습니다.

2. **경로 문제 신고 및 관리**  
   - 산책 도중 공사, 폐쇄 등으로 인해 통행이 불가능한 경로를 발견하면 관리자에게 문의할 수 있습니다.  
   - 관리자가 해당 문제를 확인한 후, 문제 경로를 서비스에서 제거하여 다른 사용자들의 불편을 최소화합니다.

3. **다양한 라벨링 데이터 활용**  
   - Walk-All은 자체적으로 골목길, 편한 길 등 세분화된 라벨링 데이터를 활용합니다.  
   - 이를 통해 기존 API에서 제공하지 않는 다양한 코스를 경험할 수 있어, 독자적인 산책코스를 추천해드립니다.


---

### 사용설명

#### 로그인 및 회원가입 화면
| <img src="https://github.com/user-attachments/assets/aad1faac-619c-42e2-bc58-81671f9a27ce" width="250" style="border-radius:10px;"> | <img src="https://github.com/user-attachments/assets/c13209ff-6420-4b82-81dc-9226caf47bf5" width="250" style="border-radius:10px;"> |
|:---:|:---:|
| **로그인 화면** | **회원가입 화면** |

로그인 및 회원가입 화면입니다.
기존 회원은 아이디와 비밀번호를 통해 로그인합니다. <br>
신규 회원은 회원가입 후 서비스를 이용할 수 있습니다.

---

#### 경유지 설정 및 목표 설정
| <img src="https://github.com/user-attachments/assets/ed3239f0-2e80-443b-9d14-7ff38021098b" width="250" style="border-radius:10px;"> | <img src="https://github.com/user-attachments/assets/46d43ef4-e227-4f6e-aaa9-7fe1fd78e189" width="250" style="border-radius:10px;"> |
|:---:|:---:|
| **경유지 설정 화면** | **목표 설정 화면** |

사용자 목표 설정 화면입니다. <br>
지도 상에서 터치를 통해 출발지, 도착지, 그리고 최대 10개의 경유지를 선택할 수 있습니다.   <br>
또한 원하는 산책 목표(시간, 거리)를 상세한 목표설정이 가능합니다.

---

#### 추천 경로 확인  
| <img src="https://github.com/user-attachments/assets/6e2f0963-7d1e-48e0-bc41-3d8d44e2fd97" width="250" style="border-radius:10px;"> |
|:---:|
| **추천 경로 화면** |


사용자가 설정한 목표에 맞춰 경로를 추천해줍니다. <br>
최대 5개의 경로를 추천받을 수 있으며 원하는 경로를 선택 후 네비게이션을 실행할 수 있습니다.

---

#### 네비게이션 및 경로 문제 문의
| <img src="https://github.com/user-attachments/assets/285e0c4c-54e4-4915-8b0a-3e9413fbc1a7" width="250" style="border-radius:10px;"> | <img src="https://github.com/user-attachments/assets/443348b3-d854-4916-a3e7-d855b3aaf4ad" width="250" style="border-radius:10px;"> |
|:---:|:---:|
| **네비게이션 화면** | **경로 문제 문의 화면** |

네비게이션 화면입니다. 시작점에 화살표로 산책 진행방향을 표시합니다. <br>
또한 산책 중 공사나 폐쇄된 길을 발견한 경우, "경로 문제 문의" 화면에서 관리자에게 해당 문제를 보고할 수 있습니다.

---

#### 히스토리 화면
| <img src="https://github.com/user-attachments/assets/bb5a2d49-0256-4a38-8eb8-80446fea7373" width="250" style="border-radius:10px;"> | <img src="https://github.com/user-attachments/assets/5d20dba6-ecf4-48b7-9aeb-90a222531004" width="250" style="border-radius:10px;"> |
|:---:|:---:|
| **경로 히스토리 화면** | **문의 내역 화면** |

히스토리 화면입니다. <br>
**경로 히스토리 탭**에서는 사용자가 걸었던 코스들을 열람할 수 있습니다. <br>
**문의 내역 탭**에서는 문의내역과 처리상태를 열람할 수 있습니다.



---

### 실행방법
1. 프로젝트 클론 후, 필요한 라이브러리 설치:  
   ```bash
   npm install

---

## 실행 방법

```bash
npm install
npm start
```

위 명령어를 순서대로 실행하면 로컬 환경에서 Walk-All을 체험해보실 수 있습니다.

---

## 매뉴얼 PDF

자세한 사용 방법 및 기능 설명은 아래 **매뉴얼 PDF**에서 확인하실 수 있습니다.  
[매뉴얼 PDF 바로가기](./manual.pdf)

---
