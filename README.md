

> 🚧 **WIP — To Come — everything**

---

Project Colony Drop is a love letter to the old Gundam forum RPGs that lived and died on Geocities and early web forums in the early 2000s — threadbare HTML pages where fans would write out their pilot stats, pick a mobile suit from a text list, and battle it out in collaborative fiction one post at a time.

This project is an attempt to bring that spirit into something fully playable and properly structured, Based on the [Mobile Suit Gundam 5e](https://gundam5e.com) ruleset — a free fan adaptation of D&D 5th Edition set in the Universal Century. The end goal is a full browser-based multiplayer RPG platform: players create their pilot, choose their mobile suit, and manage their character through a shared persistent world — while Game Master's oversee the action, interactions, and drives the narrative. Think less companion app, more digital tabletop with a GM almost always sitting at the head of the table.

The interface leans fully into the retro aesthetic: a Windows 95-style desktop running in the browser, complete with draggable windows, a taskbar, and the kind of pixelated charm that feels right at home with a Zaku II stat block. The goal is something that feels like you're booting it up on a beige tower PC in 2002 — but actually works like a modern web application underneath.

While the Gundam UC setting drives the current build, the long-term goal is to develop this into a general-purpose framework — one that could power any 5e-adjacent tabletop RPG, or give someone the foundation to build their own setting from scratch. The Gundam skin is the first use case, not the ceiling.

---

## 📋 MS Store — Mobile Suit Images

For each ❌ suit below, find the image on [The Gundam Wiki](https://gundam.fandom.com), right-click the main suit image → **Copy image address**, then paste it into the `img:'...'` field at the end of that suit's entry in **msstore.html**.

### ✅ Confirmed — URLs should be correct (verify they load)

| Status | Suit Name | ID in msstore.html | Gundam Wiki Page |
|---|---|---|---|
| ✅ CHECK | MS-05B Zaku I | `ms05b` | [wiki/MS-05B_Zaku_I](https://gundam.fandom.com/wiki/MS-05B_Zaku_I) |
| ✅ CHECK | MS-06F Zaku II | `ms06f` | [wiki/MS-06F_Zaku_II](https://gundam.fandom.com/wiki/MS-06F_Zaku_II) |
| ✅ CHECK | MS-06S Zaku II Commander | `ms06s` | [wiki/MS-06S_Zaku_II](https://gundam.fandom.com/wiki/MS-06S_Zaku_II) |
| ✅ CHECK | MS-07B Gouf | `ms07b` | [wiki/MS-07B_Gouf](https://gundam.fandom.com/wiki/MS-07B_Gouf) |
| ✅ CHECK | MS-09B Dom | `ms09b` | [wiki/MS-09_Dom](https://gundam.fandom.com/wiki/MS-09_Dom) |
| ✅ CHECK | MS-09R Rick Dom | `ms09r` | [wiki/MS-09R_Rick_Dom](https://gundam.fandom.com/wiki/MS-09R_Rick_Dom) |
| ✅ CHECK | MS-14A Gelgoog | `ms14a` | [wiki/MS-14A_Gelgoog](https://gundam.fandom.com/wiki/MS-14A_Gelgoog) |
| ✅ CHECK | MSM-04 Acguy | `msm04` | [wiki/MSM-04_Acguy](https://gundam.fandom.com/wiki/MSM-04_Acguy) |
| ✅ CHECK | MSM-07 Z'Gok | `msm07` | [wiki/MSM-07_Z'Gok](https://gundam.fandom.com/wiki/MSM-07_Z%27Gok) |
| ✅ CHECK | RX-75-4 Guntank | `rx752` | [wiki/RX-75-4_Guntank](https://gundam.fandom.com/wiki/RX-75-4_Guntank) |
| ✅ CHECK | RX-77-2 Guncannon | `rx772` | [wiki/RX-77-2_Guncannon](https://gundam.fandom.com/wiki/RX-77-2_Guncannon) |
| ✅ CHECK | RX-78-2 Gundam | `rx782` | [wiki/RX-78-2_Gundam](https://gundam.fandom.com/wiki/RX-78-2_Gundam) |
| ✅ CHECK | RGM-79 GM | `rgm79` | [wiki/RGM-79_GM](https://gundam.fandom.com/wiki/RGM-79_GM) |
| ✅ CHECK | MRX-009 Psycho Gundam | `mrx009` | [wiki/MRX-009_Psycho_Gundam](https://gundam.fandom.com/wiki/MRX-009_Psycho_Gundam) |

### ❌ TODO — Placeholder images that need a real URL

**How to update:** click the link → right-click suit image → Copy image address → paste into `img:'...'` in `msstore.html`

#### One Year War — Principality of Zeon

| Status | Suit Name | ID | Gundam Wiki Page |
|---|---|---|---|
| ❌ TODO | MS-06J Zaku II Ground Type | `ms06j` | [wiki/MS-06J_Zaku_II_Ground_Type](https://gundam.fandom.com/wiki/MS-06J_Zaku_II_Ground_Type) |
| ❌ TODO | MS-06FZ Zaku II Kai | `ms06fz` | [wiki/MS-06FZ_Zaku_II_Kai](https://gundam.fandom.com/wiki/MS-06FZ_Zaku_II_Kai) |
| ❌ TODO | MS-06K Zaku Cannon | `ms06k` | [wiki/MS-06K_Zaku_Cannon](https://gundam.fandom.com/wiki/MS-06K_Zaku_Cannon) |
| ❌ TODO | MS-07B-3 Gouf Custom | `ms07b3` | [wiki/MS-07B-3_Gouf_Custom](https://gundam.fandom.com/wiki/MS-07B-3_Gouf_Custom) |
| ❌ TODO | MS-09R-II Rick Dom II | `ms09rii` | [wiki/MS-09R-2_Rick_Dom_II](https://gundam.fandom.com/wiki/MS-09R-2_Rick_Dom_II) |
| ❌ TODO | MS-14Jg Gelgoog Jäger | `ms14jg` | [wiki/MS-14Jg_Gelgoog_Jäger](https://gundam.fandom.com/wiki/MS-14Jg_Gelgoog_J%C3%A4ger) |
| ❌ TODO | MS-18E Kämpfer | `ms18e` | [wiki/MS-18E_Kämpfer](https://gundam.fandom.com/wiki/MS-18E_K%C3%A4mpfer) |
| ❌ TODO | MSM-03 Gogg | `msm03` | [wiki/MSM-03_Gogg](https://gundam.fandom.com/wiki/MSM-03_Gogg) |
| ❌ TODO | MSM-07E Z'Gok-E | `msm07e` | [wiki/MSM-07E_Z'Gok-E](https://gundam.fandom.com/wiki/MSM-07E_Z%27Gok-E) |
| ❌ TODO | MSM-10 Zock | `msm10` | [wiki/MSM-10_Zock](https://gundam.fandom.com/wiki/MSM-10_Zock) |
| ❌ TODO | MSN-02 Zeong | `msn02` | [wiki/MSN-02_Zeong](https://gundam.fandom.com/wiki/MSN-02_Zeong) |
| ❌ TODO | YMS-15 Gyan | `yms15` | [wiki/YMS-15_Gyan](https://gundam.fandom.com/wiki/YMS-15_Gyan) |

#### One Year War — Earth Federation

| Status | Suit Name | ID | Gundam Wiki Page |
|---|---|---|---|
| ❌ TODO | RX-78NT-1 Gundam NT-1 "Alex" | `rx78nt1` | [wiki/RX-78NT-1_Gundam_NT-1](https://gundam.fandom.com/wiki/RX-78NT-1_Gundam_NT-1) |
| ❌ TODO | RGM-79[G] GM Ground Type | `rgm79g` | [wiki/RGM-79[G]_GM_Ground_Type](https://gundam.fandom.com/wiki/RGM-79%5BG%5D_GM_Ground_Type) |
| ❌ TODO | RGM-79SP GM Sniper II | `rgm79sp` | [wiki/RGM-79SP_GM_Sniper_II](https://gundam.fandom.com/wiki/RGM-79SP_GM_Sniper_II) |
| ❌ TODO | RX-79[G] Gundam Ground Type | `rx79g` | [wiki/RX-79[G]_Gundam_Ground_Type](https://gundam.fandom.com/wiki/RX-79%5BG%5D_Gundam_Ground_Type) |

#### Stardust Memory

| Status | Suit Name | ID | Gundam Wiki Page |
|---|---|---|---|
| ❌ TODO | RX-78GP01 Gundam "Zephyranthes" | `rx78gp01` | [wiki/RX-78GP01_Gundam](https://gundam.fandom.com/wiki/RX-78GP01_Gundam) |
| ❌ TODO | RX-78GP02A Gundam "Physalis" | `rx78gp02` | [wiki/RX-78GP02A_Gundam](https://gundam.fandom.com/wiki/RX-78GP02A_Gundam) |

#### Gryps Conflict

| Status | Suit Name | ID | Gundam Wiki Page |
|---|---|---|---|
| ❌ TODO | RX-178 Gundam Mk-II | `rx178` | [wiki/RX-178_Gundam_Mk-II](https://gundam.fandom.com/wiki/RX-178_Gundam_Mk-II) |
| ❌ TODO | MSZ-006 Zeta Gundam | `msz006` | [wiki/MSZ-006_Zeta_Gundam](https://gundam.fandom.com/wiki/MSZ-006_Zeta_Gundam) |
| ❌ TODO | MSN-00100 Hyaku Shiki | `msn00100` | [wiki/MSN-00100_Hyaku_Shiki](https://gundam.fandom.com/wiki/MSN-00100_Hyaku_Shiki) |
| ❌ TODO | MSA-003 Nemo | `msa003` | [wiki/MSA-003_Nemo](https://gundam.fandom.com/wiki/MSA-003_Nemo) |
| ❌ TODO | RMS-106 Hi-Zack | `rms106` | [wiki/RMS-106_Hi-Zack](https://gundam.fandom.com/wiki/RMS-106_Hi-Zack) |
| ❌ TODO | PMX-003 The O | `pmx003` | [wiki/PMX-003_The_O](https://gundam.fandom.com/wiki/PMX-003_The_O) |
| ❌ TODO | RX-139 Hambrabi | `rx139` | [wiki/RX-139_Hambrabi](https://gundam.fandom.com/wiki/RX-139_Hambrabi) |
| ❌ TODO | AMX-003 Gaza-C | `amx003` | [wiki/AMX-003_Gaza-C](https://gundam.fandom.com/wiki/AMX-003_Gaza-C) |
| ❌ TODO | AMX-004 Qubeley | `amx004` | [wiki/AMX-004_Qubeley](https://gundam.fandom.com/wiki/AMX-004_Qubeley) |

#### Second Neo Zeon War (ZZ era)

| Status | Suit Name | ID | Gundam Wiki Page |
|---|---|---|---|
| ❌ TODO | MSZ-010 ZZ Gundam | `msz010` | [wiki/MSZ-010_ZZ_Gundam](https://gundam.fandom.com/wiki/MSZ-010_ZZ_Gundam) |
| ❌ TODO | AMX-014 Döven Wolf | `amx014` | [wiki/AMX-014_Döven_Wolf](https://gundam.fandom.com/wiki/AMX-014_D%C3%B6ven_Wolf) |
| ❌ TODO | AMX-011 Zaku III | `amx011` | [wiki/AMX-011_Zaku_III](https://gundam.fandom.com/wiki/AMX-011_Zaku_III) |
| ❌ TODO | AMX-103 Hamma Hamma | `amx103` | [wiki/AMX-103_Hamma_Hamma](https://gundam.fandom.com/wiki/AMX-103_Hamma_Hamma) |

#### Char's Counterattack (0093)

| Status | Suit Name | ID | Gundam Wiki Page |
|---|---|---|---|
| ❌ TODO | RX-93 ν Gundam | `rx93` | [wiki/RX-93_ν_Gundam](https://gundam.fandom.com/wiki/RX-93_%CE%BD_Gundam) |
| ❌ TODO | MSN-04 Sazabi | `msn04` | [wiki/MSN-04_Sazabi](https://gundam.fandom.com/wiki/MSN-04_Sazabi) |
| ❌ TODO | MSN-03 Jagd Doga | `msn03` | [wiki/MSN-03_Jagd_Doga](https://gundam.fandom.com/wiki/MSN-03_Jagd_Doga) |
| ❌ TODO | AMS-119 Geara Doga | `ams119` | [wiki/AMS-119_Geara_Doga](https://gundam.fandom.com/wiki/AMS-119_Geara_Doga) |
| ❌ TODO | RGM-89 Jegan | `rgm89` | [wiki/RGM-89_Jegan](https://gundam.fandom.com/wiki/RGM-89_Jegan) |
| ❌ TODO | RGZ-91 Re-GZ | `rgz91` | [wiki/RGZ-91_Re-GZ](https://gundam.fandom.com/wiki/RGZ-91_Re-GZ) |

#### Unicorn Era (0096)

| Status | Suit Name | ID | Gundam Wiki Page |
|---|---|---|---|
| ❌ TODO | RX-0 Unicorn Gundam | `rx0` | [wiki/RX-0_Unicorn_Gundam](https://gundam.fandom.com/wiki/RX-0_Unicorn_Gundam) |
| ❌ TODO | MSN-06S Sinanju | `msn06s` | [wiki/MSN-06S_Sinanju](https://gundam.fandom.com/wiki/MSN-06S_Sinanju) |
| ❌ TODO | AMS-129 Geara Zulu | `ams129` | [wiki/AMS-129_Geara_Zulu](https://gundam.fandom.com/wiki/AMS-129_Geara_Zulu) |
| ❌ TODO | RGM-96X Jesta | `rgm96x` | [wiki/RGM-96X_Jesta](https://gundam.fandom.com/wiki/RGM-96X_Jesta) |
| ❌ TODO | RGZ-95 ReZEL | `rgz95` | [wiki/RGZ-95_ReZEL](https://gundam.fandom.com/wiki/RGZ-95_ReZEL) |
| ❌ TODO | NZ-666 Kshatriya | `nz666` | [wiki/NZ-666_Kshatriya](https://gundam.fandom.com/wiki/NZ-666_Kshatriya) |

---

## 📋 Future Tasks

| Status | Task | Notes |
|---|---|---|
| ❌ TODO | Add a proper backend/database for user accounts | Currently using localStorage. Consider Node.js + MySQL when ready. |
| ❌ TODO | Populate Inventory — Weapons panel | Currently shows placeholder text. |
| ❌ TODO | Populate Inventory — Armour panel | Currently shows placeholder text. |
| ❌ TODO | Populate Map window | Currently shows placeholder text. |
| ❌ TODO | Replace Browser window URL | Currently points to example.com which blocks iframes. Replace with a useful internal page. |

---

## 📜 Credits and Stuff

**Scripts used**

- FOS - Fake Operating System
  https://github.com/victorqribeiro/FOS

- Windows 95 UI Kit
  https://github.com/themesberg/windows-95-ui-kit
