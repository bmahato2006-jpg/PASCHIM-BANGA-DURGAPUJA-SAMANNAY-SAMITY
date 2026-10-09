# Bengali Text Extraction & Review Document

> **Generated**: 2026-10-09T20:22:08.012Z
> **Scope**: Entire codebase (`src/app`, `src/components`, `src/data`, `src/api`)
> **Regex Pattern**: Bengali Unicode Block (`/[\u0980-\u09FF]+/`)
> **Total Files Scanned**: 16
> **Total Bengali Occurrences**: 363
> **Unique Bengali Phrases**: 299

This document contains the complete extraction of all hardcoded Bengali text, UI labels, toasts, form field instructions, modal alerts, and header texts across the application. You can review the strings directly by file, or copy from the aggregated list at the end.

## Table of Contents

1. [src/app/api/admin/clear-demo/route.ts](#src-app-api-admin-clear-demo-route-ts) (4 lines with Bengali text)
2. [src/app/api/admin/delete/route.ts](#src-app-api-admin-delete-route-ts) (4 lines with Bengali text)
3. [src/app/dashboard/admin/page.tsx](#src-app-dashboard-admin-page-tsx) (73 lines with Bengali text)
4. [src/app/dashboard/organizer/page.tsx](#src-app-dashboard-organizer-page-tsx) (92 lines with Bengali text)
5. [src/app/not-found.tsx](#src-app-not-found-tsx) (9 lines with Bengali text)
6. [src/app/organizer/auth/page.tsx](#src-app-organizer-auth-page-tsx) (17 lines with Bengali text)
7. [src/app/organizer/callback/page.tsx](#src-app-organizer-callback-page-tsx) (1 lines with Bengali text)
8. [src/app/organizer/setup/page.tsx](#src-app-organizer-setup-page-tsx) (2 lines with Bengali text)
9. [src/app/page.tsx](#src-app-page-tsx) (42 lines with Bengali text)
10. [src/app/vote/[committeeId]/page.tsx](#src-app-vote--committeeid--page-tsx) (32 lines with Bengali text)
11. [src/components/layout/Footer.tsx](#src-components-layout-footer-tsx) (31 lines with Bengali text)
12. [src/components/layout/Navbar.tsx](#src-components-layout-navbar-tsx) (15 lines with Bengali text)
13. [src/components/organizer/OrganizerDashboard.tsx](#src-components-organizer-organizerdashboard-tsx) (4 lines with Bengali text)
14. [src/components/voter/LiveLeaderboard.tsx](#src-components-voter-liveleaderboard-tsx) (2 lines with Bengali text)
15. [src/components/voter/MyVotesView.tsx](#src-components-voter-myvotesview-tsx) (5 lines with Bengali text)
16. [src/data/mockPandals.ts](#src-data-mockpandals-ts) (4 lines with Bengali text)
17. [Master List of All Unique Bengali Phrases (299 items)](#master-list-of-all-unique-bengali-phrases)

---

## File-by-File Detailed Extraction

### <a id="src-app-api-admin-clear-demo-route-ts"></a>1. `src/app/api/admin/clear-demo/route.ts`

- **Lines Containing Bengali:** 4

| Line | Extracted Bengali Text | Code Context |
| :--- | :--- | :--- |
| Line 50 | **অননুমোদিত প্রবেশাধিকার! শুধুমাত্র অনুমোদিত সুপার অ্যাডমিন টেস্ট ডেটা মুছতে পারেন** | `message: 'অননুমোদিত প্রবেশাধিকার! শুধুমাত্র অনুমোদিত সুপার অ্যাডমিন টেস্ট ডেটা মুছতে পারেন। (Unauthorized: Super Admin access required)',` |
| Line 61 | **নিরাপত্তা নিশ্চিতকরণ ব্যর্থ হয়েছে** <br> **প্রদান করুন** | `message: 'নিরাপত্তা নিশ্চিতকরণ ব্যর্থ হয়েছে। confirmation: "CLEAR_ALL_DEMO_DATA" প্রদান করুন।',` |
| Line 78 | **সমস্ত টেস্ট/ডেমো ডেটা সফলভাবে ডাটাবেস থেকে মুছে ফেলা হয়েছে** | `message: 'সমস্ত টেস্ট/ডেমো ডেটা সফলভাবে ডাটাবেস থেকে মুছে ফেলা হয়েছে। (All demo/test data successfully cleared)',` |
| Line 93 | **ডেটা মুছে ফেলার সময় সার্ভার ত্রুটি ঘটেছে** | `message: err?.message \|\| 'ডেটা মুছে ফেলার সময় সার্ভার ত্রুটি ঘটেছে। (An error occurred while clearing demo data)',` |

---

### <a id="src-app-api-admin-delete-route-ts"></a>2. `src/app/api/admin/delete/route.ts`

- **Lines Containing Bengali:** 4

| Line | Extracted Bengali Text | Code Context |
| :--- | :--- | :--- |
| Line 24 | **অননুমোদিত প্রবেশাধিকার! শুধুমাত্র অনুমোদিত সুপার অ্যাডমিন কমিটি মুছে ফেলতে পারেন** | `message: 'অননুমোদিত প্রবেশাধিকার! শুধুমাত্র অনুমোদিত সুপার অ্যাডমিন কমিটি মুছে ফেলতে পারেন। (Unauthorized: Super Admin access required)',` |
| Line 35 | **কমিটি আইডি প্রদান করা আবশ্যক** | `message: 'কমিটি আইডি প্রদান করা আবশ্যক। (Committee ID is required)',` |
| Line 56 | **কমিটি** <br> **সফলভাবে ডাটাবেস থেকে মুছে ফেলা হয়েছে** | `message: 'কমিটি "${cleanId}" সফলভাবে ডাটাবেস থেকে মুছে ফেলা হয়েছে। (Committee deleted successfully)',` |
| Line 66 | **কমিটি মুছে ফেলার সময় ত্রুটি ঘটেছে** | `message: err?.message \|\| 'কমিটি মুছে ফেলার সময় ত্রুটি ঘটেছে। (An error occurred while deleting the committee)',` |

---

### <a id="src-app-dashboard-admin-page-tsx"></a>3. `src/app/dashboard/admin/page.tsx`

- **Lines Containing Bengali:** 73

| Line | Extracted Bengali Text | Code Context |
| :--- | :--- | :--- |
| Line 100 | **অননুমোদিত প্রবেশাধিকার! শুধুমাত্র অনুমোদিত সুপার অ্যাডমিন প্রবেশ করতে পারবেন** | `toast.error('অননুমোদিত প্রবেশাধিকার! শুধুমাত্র অনুমোদিত সুপার অ্যাডমিন প্রবেশ করতে পারবেন। (Access Denied: Super Admin only)', {` |
| Line 130 | **সাধারণ অঞ্চল** | `ward: data.ward \|\| 'সাধারণ অঞ্চল (General Zone)',` |
| Line 136 | **ঐতিহ্যবাহী দুর্গাপূজা** | `theme: data.theme \|\| 'ঐতিহ্যবাহী দুর্গাপূজা (Traditional Durga Puja)',` |
| Line 244 | **অননুমোদিত প্রবেশাধিকার! শুধুমাত্র অনুমোদিত সুপার অ্যাডমিন কমিটি অনুমোদন করতে পারেন** | `toast.error('অননুমোদিত প্রবেশাধিকার! শুধুমাত্র অনুমোদিত সুপার অ্যাডমিন কমিটি অনুমোদন করতে পারেন। (Super Admin only)');` |
| Line 260 | **অনুমোদন করা হচ্ছে** | `const toastId = toast.loading('"${committeeName}" অনুমোদন করা হচ্ছে... (Approving...)');` |
| Line 280 | **কমিটি অনুমোদিত হয়েছে** | `toast.success('কমিটি অনুমোদিত হয়েছে! (Committee Approved successfully!)', { id: toastId, duration: 4000 });` |
| Line 304 | **কোনো ফোন নম্বর নেই** | `toast.error("SMS Failed: কোনো ফোন নম্বর নেই (No phone number registered)", { duration: 8000 });` |
| Line 317 | **অননুমোদিত প্রবেশাধিকার! শুধুমাত্র অনুমোদিত সুপার অ্যাডমিন কমিটি মুছে ফেলতে পারেন** | `toast.error('অননুমোদিত প্রবেশাধিকার! শুধুমাত্র অনুমোদিত সুপার অ্যাডমিন কমিটি মুছে ফেলতে পারেন। (Super Admin only)');` |
| Line 334 | **স্থায়ীভাবে মুছে ফেলা হচ্ছে** | `const toastId = toast.loading('"${committeeName}" স্থায়ীভাবে মুছে ফেলা হচ্ছে... (Deleting...)');` |
| Line 346 | **স্থায়ীভাবে মুছে ফেলা হয়েছে** | `'🗑️ "${committeeName}" স্থায়ীভাবে মুছে ফেলা হয়েছে! (Committee permanently deleted!)',` |
| Line 374 | **স্থায়ীভাবে মুছে ফেলা হয়েছে** | `'🗑️ "${committeeName}" স্থায়ীভাবে মুছে ফেলা হয়েছে! (Committee permanently deleted!)',` |
| Line 378 | **কমিটি মুছে ফেলতে ব্যর্থ হয়েছে** | `toast.error(data.message \|\| 'কমিটি মুছে ফেলতে ব্যর্থ হয়েছে। (Deletion failed)', { id: toastId });` |
| Line 381 | **নেটওয়ার্ক ত্রুটি! কমিটি মুছে ফেলা যায়নি** | `toast.error('নেটওয়ার্ক ত্রুটি! কমিটি মুছে ফেলা যায়নি। (Network error during deletion)', { id: toastId });` |
| Line 393 | **ভোটিং ব্যবস্থা সক্রিয় করা হয়েছে** | `toast.success('ভোটিং ব্যবস্থা সক্রিয় করা হয়েছে (Voting Resumed)');` |
| Line 395 | **ভোটিং সাময়িকভাবে স্থগিত রাখা হয়েছে** | `toast.error('ভোটিং সাময়িকভাবে স্থগিত রাখা হয়েছে (Voting Paused)');` |
| Line 403 | **অ্যাডমিন লগআউট সম্পন্ন হয়েছে** | `toast.success('অ্যাডমিন লগআউট সম্পন্ন হয়েছে (Admin Logged Out)');` |
| Line 406 | **লগআউট ব্যর্থ হয়েছে** | `toast.error('লগআউট ব্যর্থ হয়েছে (Sign Out Failed)');` |
| Line 413 | **ডাউনলোড করার মতো কোনো কমিটি ডেটা নেই** | `toast.error('ডাউনলোড করার মতো কোনো কমিটি ডেটা নেই (No committee data to download)');` |
| Line 471 | **কমিটি ডেটা** <br> **সফলভাবে ডাউনলোড হয়েছে** | `toast.success('কমিটি ডেটা (CSV) সফলভাবে ডাউনলোড হয়েছে (CSV Downloaded Successfully)!');` |
| Line 484 | **সুপার অ্যাডমিন অধিবেশন যাচাই করা হচ্ছে** | `সুপার অ্যাডমিন অধিবেশন যাচাই করা হচ্ছে...` |
| Line 506 | **অননুমোদিত প্রবেশাধিকার** | `অননুমোদিত প্রবেশাধিকার` |
| Line 512 | **সুপার অ্যাডমিন কন্ট্রোল প্যানেল শুধুমাত্র অনুমোদিত সুপার অ্যাডমিন অ্যাকাউন্টের জন্য সংরক্ষিত। আপনাকে আয়োজক ড্যাশবোর্ডে পুনর্নির্দেশ করা হচ্ছে** | `সুপার অ্যাডমিন কন্ট্রোল প্যানেল শুধুমাত্র অনুমোদিত সুপার অ্যাডমিন অ্যাকাউন্টের জন্য সংরক্ষিত। আপনাকে আয়োজক ড্যাশবোর্ডে পুনর্নির্দেশ করা হচ্ছে...` |
| Line 534 | **আয়োজক ড্যাশবোর্ডে ফিরে যান** | `<span>আয়োজক ড্যাশবোর্ডে ফিরে যান (Return to Organizer Dashboard)</span>` |
| Line 559 | **মাস্টার অ্যাডমিন ড্যাশবোর্ড** | `মাস্টার অ্যাডমিন ড্যাশবোর্ড` |
| Line 588 | **আয়োজক ডেস্ক** | `<span className="hidden sm:inline">আয়োজক ডেস্ক (Organizer Desk)</span>` |
| Line 589 | **ডেস্ক** | `<span className="sm:hidden">ডেস্ক</span>` |
| Line 598 | **অনুমোদিত সুপার অ্যাডমিন** | `অনুমোদিত সুপার অ্যাডমিন (Authorized)` |
| Line 607 | **লগআউট** | `<span className="hidden sm:inline">লগআউট (Sign Out)</span>` |
| Line 626 | **পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি • লাইভ অডিট কনসোল** | `<span>পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি • লাইভ অডিট কনসোল</span>` |
| Line 629 | **সার্বজনীন পর্যবেক্ষণ ও অনুমোদন কেন্দ্র** | `সার্বজনীন পর্যবেক্ষণ ও অনুমোদন কেন্দ্র` |
| Line 647 | **লাইভ ফায়ারস্টোর সিঙ্ক** | `<span>লাইভ ফায়ারস্টোর সিঙ্ক (Live Sync)</span>` |
| Line 662 | **মোট নিবন্ধিত কমিটি** | `মোট নিবন্ধিত কমিটি` |
| Line 685 | **অনুমোদিত** | `<span>অনুমোদিত: {approvedCommitteesCount}</span>` |
| Line 690 | **অপেক্ষমাণ** | `<span>অপেক্ষমাণ: {pendingCommitteesCount}</span>` |
| Line 701 | **মোট প্রদত্ত ভোট** | `মোট প্রদত্ত ভোট` |
| Line 732 | **শীর্ষস্থানীয় মণ্ডপ** | `শীর্ষস্থানীয় মণ্ডপ` |
| Line 745 | **তথ্য সংগৃহীত হচ্ছে** | `{rankedCommittees[0]?.committee_name \|\| 'তথ্য সংগৃহীত হচ্ছে...'}` |
| Line 748 | **ভোট সংখ্যা** <br> **ভোট** | `ভোট সংখ্যা: <strong className="font-mono text-gray-900">{rankedCommittees[0]?.resolvedVotes \|\| 0}</strong> ভোট (Votes)` |
| Line 754 | **১ম স্থান অধিকারী কমিটি** | `<span>১ম স্থান অধিকারী কমিটি (Rank 1 Leader)</span>` |
| Line 763 | **ভোটিং নিরাপত্তা** | `ভোটিং নিরাপত্তা` |
| Line 776 | **১০০** | `১০০%` |
| Line 785 | **এক ডিভাইসে এক ভোট** | `<span>এক ডিভাইসে এক ভোট (1 Vote Per Device)</span>` |
| Line 798 | **গ্লোবাল ভোটিং ব্যবস্থা পরিচালনা** | `<span>গ্লোবাল ভোটিং ব্যবস্থা পরিচালনা (Voting Gatekeeper)</span>` |
| Line 801 | **জরুরি পরিস্থিতিতে প্ল্যাটফর্মের ভোট গ্রহণ সক্রিয় বা স্থগিত রাখুন এবং অনুমোদিত কমিটির অডিট লগ ডাউনলোড করুন** | `জরুরি পরিস্থিতিতে প্ল্যাটফর্মের ভোট গ্রহণ সক্রিয় বা স্থগিত রাখুন এবং অনুমোদিত কমিটির অডিট লগ ডাউনলোড করুন।` |
| Line 818 | **ভোট সাময়িক স্থগিত করুন** | `? 'ভোট সাময়িক স্থগিত করুন (Pause Voting)'` |
| Line 819 | **ভোট পুনরায় চালু করুন** | `: 'ভোট পুনরায় চালু করুন (Resume Voting)'}` |
| Line 844 | **গ্লোবাল লিডারবোর্ড ও কমিটি অনুমোদন** | `গ্লোবাল লিডারবোর্ড ও কমিটি অনুমোদন` |
| Line 851 | **সর্বাধিক ভোটপ্রাপ্তির ক্রমানুসারে লাইভ তালিকা। এক ক্লিকে কমিটি অনুমোদন করুন এবং স্বয়ংক্রিয় এসএমএস পাঠান** | `সর্বাধিক ভোটপ্রাপ্তির ক্রমানুসারে লাইভ তালিকা। এক ক্লিকে কমিটি অনুমোদন করুন এবং স্বয়ংক্রিয় এসএমএস পাঠান।` |
| Line 864 | **কমিটি, ফোন বা অঞ্চল খুঁজুন** | `placeholder="কমিটি, ফোন বা অঞ্চল খুঁজুন..."` |
| Line 875 | **সকল স্থিতি** | `<option value="all">সকল স্থিতি (All Statuses)</option>` |
| Line 876 | **অনুমোদিত** | `<option value="approved">অনুমোদিত (Approved)</option>` |
| Line 877 | **অপেক্ষমাণ** | `<option value="pending">অপেক্ষমাণ (Pending)</option>` |
| Line 886 | **সকল অঞ্চল** | `<option value="all">সকল অঞ্চল (All Zones)</option>` |
| Line 900 | **ফায়ারস্টোর থেকে লাইভ তালিকা লোড হচ্ছে** | `<p className="text-xs text-gray-600 font-medium">ফায়ারস্টোর থেকে লাইভ তালিকা লোড হচ্ছে...</p>` |
| Line 906 | **কোনো কমিটি খুঁজে পাওয়া যায়নি** | `<p className="font-semibold text-gray-700">কোনো কমিটি খুঁজে পাওয়া যায়নি।</p>` |
| Line 916 | **র‍্যাংক** | `<th className="py-3.5 px-4 w-16 text-center">র‍্যাংক (Rank)</th>` |
| Line 917 | **কমিটির নাম** | `<th className="py-3.5 px-4">কমিটির নাম (Committee Name)</th>` |
| Line 918 | **অঞ্চল / ওয়ার্ড** | `<th className="py-3.5 px-4">অঞ্চল / ওয়ার্ড (Location / Zone)</th>` |
| Line 919 | **যোগাযোগ** | `<th className="py-3.5 px-4">যোগাযোগ (Contact Phone)</th>` |
| Line 920 | **মোট ভোট** | `<th className="py-3.5 px-4 text-right">মোট ভোট (Total Votes)</th>` |
| Line 921 | **স্থিতি** | `<th className="py-3.5 px-4 text-center">স্থিতি (Status)</th>` |
| Line 922 | **অ্যাকশন** | `<th className="py-3.5 px-4 text-center">অ্যাকশন (Actions)</th>` |
| Line 1000 | **ফোন নেই** | `<span className="text-[11px] text-gray-400 italic">ফোন নেই (No phone)</span>` |
| Line 1027 | **অনুমোদিত** | `<span>অনুমোদিত (Approved)</span>` |
| Line 1040 | **কমিটি অনুমোদন করুন** | `title="কমিটি অনুমোদন করুন (Approve Committee)"` |
| Line 1045 | **অনুমোদন হচ্ছে** | `<span>অনুমোদন হচ্ছে...</span>` |
| Line 1050 | **অনুমোদন করুন** | `<span>অনুমোদন করুন (Approve)</span>` |
| Line 1064 | **ব্যালট দেখুন** | `title="ব্যালট দেখুন (View Ballot)"` |
| Line 1067 | **দেখুন** | `<span>দেখুন</span>` |
| Line 1079 | **স্থায়ীভাবে মুছে ফেলুন** | `title="স্থায়ীভাবে মুছে ফেলুন (Permanently Delete)"` |
| Line 1086 | **ডিলিট** | `<span>ডিলিট (Delete)</span>` |
| Line 1102 | **মোট তালিকাভুক্ত মণ্ডপ** | `মোট তালিকাভুক্ত মণ্ডপ: <strong className="text-gray-900 font-mono">{filteredLeaderboard.length}</strong> / {totalRegisteredCommittees}` |
| Line 1128 | **পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি** | `পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি (Paschim Banga DurgaPuja Samannay Samity)` |

---

### <a id="src-app-dashboard-organizer-page-tsx"></a>4. `src/app/dashboard/organizer/page.tsx`

- **Lines Containing Bengali:** 92

| Line | Extracted Bengali Text | Code Context |
| :--- | :--- | :--- |
| Line 204 | **আপনার অ্যাকাউন্টে কোনো নিবন্ধিত দুর্গাপূজা কমিটি পাওয়া যায়নি। অনুগ্রহ করে নিবন্ধন সম্পন্ন করুন** | `toast.error('আপনার অ্যাকাউন্টে কোনো নিবন্ধিত দুর্গাপূজা কমিটি পাওয়া যায়নি। অনুগ্রহ করে নিবন্ধন সম্পন্ন করুন। (No registered committee found. Redirecting to registration...)', {` |
| Line 246 | **দুর্গাপূজা কমিটি** | `const committeeName = committee?.committee_name \|\| committee?.name \|\| committee?.clubName \|\| 'দুর্গাপূজা কমিটি';` |
| Line 247 | **পশ্চিম বর্ধমান** | `const ward = committee?.ward \|\| 'পশ্চিম বর্ধমান';` |
| Line 248 | **শারদীয় ঐতিহ্যবাহী দুর্গাপূজা** | `const theme = committee?.theme \|\| 'শারদীয় ঐতিহ্যবাহী দুর্গাপূজা';` |
| Line 249 | **আয়োজক সম্পাদক** | `const secretaryName = committee?.secretary_name \|\| user?.displayName \|\| 'আয়োজক সম্পাদক';` |
| Line 270 | **ভোটের লিঙ্ক কপি হয়েছে** | `toast.success('ভোটের লিঙ্ক কপি হয়েছে (Voting link copied)!');` |
| Line 279 | **লগআউট সম্পন্ন হয়েছে** | `toast.success('লগআউট সম্পন্ন হয়েছে (Logged out successfully)');` |
| Line 282 | **লগআউট ব্যর্থ হয়েছে** | `toast.error('লগআউট ব্যর্থ হয়েছে (Sign out failed)');` |
| Line 299 | **কোড লোড করা যায়নি** | `toast.error('QR কোড লোড করা যায়নি');` |
| Line 329 | **কোড সফলভাবে ডাউনলোড হয়েছে** | `toast.success('QR কোড সফলভাবে ডাউনলোড হয়েছে (QR Code downloaded)!');` |
| Line 337 | **কোড প্রসেস করতে সমস্যা হয়েছে** | `toast.error('QR কোড প্রসেস করতে সমস্যা হয়েছে');` |
| Line 343 | **ডাউনলোড ব্যর্থ হয়েছে** | `toast.error('ডাউনলোড ব্যর্থ হয়েছে');` |
| Line 362 | **আয়োজক লাইভ ডেস্ক লোড হচ্ছে** | `আয়োজক লাইভ ডেস্ক লোড হচ্ছে (Loading Organizer Live Desk)...` |
| Line 366 | **প্রমাণীকরণ যাচাই করা হচ্ছে** | `? 'প্রমাণীকরণ যাচাই করা হচ্ছে (Verifying Organizer Authentication)...'` |
| Line 367 | **ফায়ারস্টোর থেকে কমিটির লাইভ ডেটা আনা হচ্ছে** | `: 'ফায়ারস্টোর থেকে কমিটির লাইভ ডেটা আনা হচ্ছে (Connecting Live Firestore)...'}` |
| Line 386 | **আয়োজক লগইন প্রয়োজন** | `আয়োজক লগইন প্রয়োজন (Organizer Sign In Required)` |
| Line 389 | **আপনার দুর্গাপূজা কমিটির লাইভ ভোটিং ডেস্ক পরিচালনা করতে লগইন করুন। লগইন পেজে পুনর্নির্দেশ করা হচ্ছে** | `আপনার দুর্গাপূজা কমিটির লাইভ ভোটিং ডেস্ক পরিচালনা করতে লগইন করুন। লগইন পেজে পুনর্নির্দেশ করা হচ্ছে...` |
| Line 404 | **আয়োজক লগইন করুন** | `আয়োজক লগইন করুন (Go to Organizer Login)` |
| Line 412 | **মূল পাতায় ফিরে যান** | `← মূল পাতায় ফিরে যান (Back to Home)` |
| Line 437 | **সুপার অ্যাডমিন অধিবেশন** | `সুপার অ্যাডমিন অধিবেশন (Super Admin Session)` |
| Line 440 | **লগইন করা অ্যাকাউন্ট** | `লগইন করা অ্যাকাউন্ট: <strong className="text-gray-900">{user.email}</strong>` |
| Line 443 | **আপনার কাছে সমগ্র পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতির মাস্টার কন্ট্রোল অ্যাক্সেস রয়েছে। আপনি সরাসরি সুপার অ্যাডমিন প্যানেল পরিচালনা করতে পারেন** | `আপনার কাছে সমগ্র পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতির মাস্টার কন্ট্রোল অ্যাক্সেস রয়েছে। আপনি সরাসরি সুপার অ্যাডমিন প্যানেল পরিচালনা করতে পারেন।` |
| Line 453 | **মাস্টার অ্যাডমিন কন্ট্রোল** | `<span className="text-xs font-medium opacity-90">(মাস্টার অ্যাডমিন কন্ট্রোল)</span>` |
| Line 461 | **একটি টেস্ট মণ্ডপ কমিটি নিবন্ধন করুন** | `একটি টেস্ট মণ্ডপ কমিটি নিবন্ধন করুন (Register Test Committee)` |
| Line 469 | **লগআউট** | `লগআউট (Sign Out)` |
| Line 484 | **কমিটি নিবন্ধন প্রয়োজন** | `কমিটি নিবন্ধন প্রয়োজন (Committee Registration Required)` |
| Line 487 | **লগইন করা অ্যাকাউন্ট** | `লগইন করা অ্যাকাউন্ট (Logged in as): <strong className="text-gray-900">{user.email \|\| user.uid}</strong>` |
| Line 490 | **আপনার অ্যাকাউন্টের অধীনে কোনো অনুমোদিত দুর্গাপূজা কমিটি পাওয়া যায়নি। নিবন্ধন পেজে পুনর্নির্দেশ করা হচ্ছে** | `আপনার অ্যাকাউন্টের অধীনে কোনো অনুমোদিত দুর্গাপূজা কমিটি পাওয়া যায়নি। নিবন্ধন পেজে পুনর্নির্দেশ করা হচ্ছে...` |
| Line 506 | **কমিটি নিবন্ধন সম্পন্ন করুন** | `কমিটি নিবন্ধন সম্পন্ন করুন (Complete Registration)` |
| Line 514 | **অন্য অ্যাকাউন্ট দিয়ে লগইন করুন** | `অন্য অ্যাকাউন্ট দিয়ে লগইন করুন (Switch Account)` |
| Line 545 | **পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি** | `{ward} • পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি` |
| Line 557 | **যাচাইকরণ প্রক্রিয়াধীন** | `যাচাইকরণ প্রক্রিয়াধীন (Verification Pending)` |
| Line 566 | **লগআউট** | `<span className="hidden sm:inline">লগআউট (Sign Out)</span>` |
| Line 587 | **অ্যাডমিন অনুমোদনের অপেক্ষায়** | `<span>অ্যাডমিন অনুমোদনের অপেক্ষায় • Pending Admin Approval</span>` |
| Line 595 | **আপনার দুর্গাপূজা কমিটি সেন্ট্রাল সুপার অ্যাডমিন দ্বারা যাচাই ও অনুমোদনের অপেক্ষায় রয়েছে** | `আপনার দুর্গাপূজা কমিটি সেন্ট্রাল সুপার অ্যাডমিন দ্বারা যাচাই ও অনুমোদনের অপেক্ষায় রয়েছে।` |
| Line 606 | **নিরাপত্তা ও যাচাইকরণ নীতি** | `<span>নিরাপত্তা ও যাচাইকরণ নীতি (Security & Verification Notice)</span>` |
| Line 609 | **অনুমোদিত কমিটির জন্য অফিসিয়াল ভোটিং কিউআর কোড** <br> **এবং লাইভ ডেস্ক সংরক্ষিত রাখা হয়েছে। সুপার অ্যাডমিন দ্বারা অনুমোদিত হলে আপনি আপনার নিবন্ধিত নম্বরে একটি নিশ্চিতকরণ এসএমএস** <br> **পাবেন এবং এই পাতাটি স্বয়ংক্রিয়ভাবে লাইভ ডেস্কে রূপান্তরিত হবে** | `অনুমোদিত কমিটির জন্য অফিসিয়াল ভোটিং কিউআর কোড (QR Code) এবং লাইভ ডেস্ক সংরক্ষিত রাখা হয়েছে। সুপার অ্যাডমিন দ্বারা অনুমোদিত হলে আপনি আপনার নিবন্ধিত নম্বরে একটি নিশ্চিতকরণ এসএমএস (SMS) পাবেন এবং এই পাতাটি স্বয়ংক্রিয়ভাবে লাইভ ডেস্কে রূপান্তরিত হবে।` |
| Line 623 | **লগআউট করুন** | `<span>লগআউট করুন (Sign Out)</span>` |
| Line 629 | **মূল পাতায় ফিরে যান** | `<span>মূল পাতায় ফিরে যান (Back to Home)</span>` |
| Line 639 | **পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি** <br> **পশ্চিম বর্ধমান** | `পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি (Paschim Banga DurgaPuja Samannay Samity) • পশ্চিম বর্ধমান` |
| Line 660 | **পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি • দুর্গাপূজা ২০২৬** | `পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি • দুর্গাপূজা ২০২৬` |
| Line 687 | **ভোট দিতে** <br> **কোড স্ক্যান করুন** | `ভোট দিতে QR কোড স্ক্যান করুন (Scan QR to Vote)` |
| Line 690 | **আপনার স্মার্টফোনের ক্যামেরা বা গুগল লেন্স খুলুন** | `<li>আপনার স্মার্টফোনের ক্যামেরা বা গুগল লেন্স খুলুন।</li>` |
| Line 691 | **উপরের কিউআর কোডটি স্ক্যান করে অফিসিয়াল পেজে যান** | `<li>উপরের কিউআর কোডটি স্ক্যান করে অফিসিয়াল পেজে যান।</li>` |
| Line 692 | **সেরা প্রতিমা, সেরা ভাবনা, আলোকসজ্জা ও পরিবেশবান্ধব বিভাগে আপনার মূল্যবান ভোট দিন** | `<li>সেরা প্রতিমা, সেরা ভাবনা, আলোকসজ্জা ও পরিবেশবান্ধব বিভাগে আপনার মূল্যবান ভোট দিন।</li>` |
| Line 697 | **আইডি** | `<span>আইডি (ID): {committeeId}</span>` |
| Line 698 | **সম্পাদনা** | `<span>সম্পাদনা (Secretary): {secretaryName}</span>` |
| Line 699 | **যাচাইকৃত দুর্গাপূজা মণ্ডপ** | `<span>যাচাইকৃত দুর্গাপূজা মণ্ডপ (Verified Puja Pandal)</span>` |
| Line 717 | **লাইভ ভোটিং ডেস্ক** | `লাইভ ভোটিং ডেস্ক (Live Voting Desk)` |
| Line 721 | **লাইভ সিঙ্ক সক্রিয়** | `লাইভ সিঙ্ক সক্রিয় (Live Sync Active)` |
| Line 725 | **পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি** | `পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি (Paschim Banga DurgaPuja Samannay Samity)` |
| Line 736 | **সুপার অ্যাডমিন কন্ট্রোল প্যানেল** | `title="সুপার অ্যাডমিন কন্ট্রোল প্যানেল (Super Admin Panel)"` |
| Line 748 | **যাচাইকৃত আয়োজক** | `<ShieldCheck className="w-3 h-3" /> যাচাইকৃত আয়োজক (Verified Organizer)` |
| Line 757 | **গেট পোস্টার প্রিন্ট** | `গেট পোস্টার প্রিন্ট (Print Gate Poster)` |
| Line 765 | **লগআউট** | `লগআউট (Sign Out)` |
| Line 782 | **দুর্গাপূজা ২০২৬ নিবন্ধিত মণ্ডপ** | `<ShieldCheck className="w-3.5 h-3.5 text-sindoor-600" /> দুর্গাপূজা ২০২৬ নিবন্ধিত মণ্ডপ (Registered Durga Puja 2026)` |
| Line 794 | **ভাবনা** <br> **কমিটি কোড** | `ভাবনা (Theme): <strong className="text-gray-800">{theme}</strong> • কমিটি কোড (Code):{' '}` |
| Line 819 | **ভোটিং পেজ খুলুন** | `ভোটিং পেজ খুলুন (View Voting Page)` |
| Line 827 | **কপি সম্পন্ন** <br> **লিঙ্ক কপি করুন** | `{copied ? 'কপি সম্পন্ন (Copied)!' : 'লিঙ্ক কপি করুন (Copy Link)'}` |
| Line 848 | **মণ্ডপ কিউআর কোড** | `মণ্ডপ কিউআর কোড (Pandal Gate QR Code)` |
| Line 851 | **অফিসিয়াল মণ্ডপ ভোটিং কিউআর** | `অফিসিয়াল মণ্ডপ ভোটিং কিউআর (Official Gate Voting QR)` |
| Line 858 | **সক্রিয়** | `সক্রিয় (Active)` |
| Line 863 | **দর্শনার্থীরা মণ্ডপে প্রবেশ করে এই কিউআর স্ক্যান করলেই সরাসরি ভোট প্রদান করতে পারবেন** | `দর্শনার্থীরা মণ্ডপে প্রবেশ করে এই কিউআর স্ক্যান করলেই সরাসরি ভোট প্রদান করতে পারবেন।` |
| Line 873 | **ভোট দিতে** <br> **কোড স্ক্যান করুন** | `ভোট দিতে QR কোড স্ক্যান করুন (Scan QR to Vote)` |
| Line 902 | **ডাউনলোড হচ্ছে** <br> **কোড ডাউনলোড করুন** | `{isDownloading ? 'ডাউনলোড হচ্ছে... (Downloading...)' : 'QR কোড ডাউনলোড করুন (Download QR Code)'}` |
| Line 910 | **পোস্টার প্রিন্ট** | `পোস্টার প্রিন্ট (Print Poster)` |
| Line 919 | **ভোটের লিংক কপি সম্পন্ন** <br> **ভোটের লিঙ্ক কপি করুন** | `{copied ? 'ভোটের লিংক কপি সম্পন্ন (Copied)!' : 'ভোটের লিঙ্ক কপি করুন (Copy Voting Link)'}` |
| Line 924 | **আয়োজকদের জন্য নির্দেশিকা** | `<Radio className="w-3.5 h-3.5 text-sindoor-600" /> আয়োজকদের জন্য নির্দেশিকা (Organizer Tips):` |
| Line 927 | **পোস্টারটি প্রিন্ট করে মণ্ডপের প্রধান তোরণ বা প্রবেশদ্বারে বড় করে প্রদর্শন করুন যাতে দর্শনার্থীরা সহজে ভোট দিতে পারেন** | `পোস্টারটি প্রিন্ট করে মণ্ডপের প্রধান তোরণ বা প্রবেশদ্বারে বড় করে প্রদর্শন করুন যাতে দর্শনার্থীরা সহজে ভোট দিতে পারেন।` |
| Line 956 | **ফায়ারস্টোর লাইভ কাউন্টার** | `ফায়ারস্টোর লাইভ কাউন্টার (Real-time Firestore)` |
| Line 960 | **মোট ভোট** | `মোট ভোট (Total Votes)` |
| Line 966 | **তাৎক্ষণিক আপডেট** | `তাৎক্ষণিক আপডেট (Instant Update)` |
| Line 977 | **মোট ভোট** | `মোট ভোট (Total Votes)` |
| Line 980 | **ইংরেজি সংখ্যা** | `ইংরেজি সংখ্যা (English digits): <strong className="font-mono text-gray-800">{liveTotalVotes}</strong>` |
| Line 990 | **প্রতিটি ভোট ডিভাইসের নির্ভরযোগ্য ফায়ারস্টোর ট্রানজ্যাকশন দ্বারা সুরক্ষিত এবং দ্বৈত ভোট প্রতিরোধ ব্যবস্থার সাথে যুক্ত** | `প্রতিটি ভোট ডিভাইসের নির্ভরযোগ্য ফায়ারস্টোর ট্রানজ্যাকশন দ্বারা সুরক্ষিত এবং দ্বৈত ভোট প্রতিরোধ ব্যবস্থার সাথে যুক্ত।` |
| Line 1008 | **বিভাগভিত্তিক লাইভ ফলাফল** | `বিভাগভিত্তিক লাইভ ফলাফল (Category Breakdown)` |
| Line 1012 | **৪টি অফিসিয়াল বিভাগ** | `৪টি অফিসিয়াল বিভাগ (4 Official Categories)` |
| Line 1025 | **সেরা প্রতিমা** | `<h4 className="text-xs font-bold text-gray-900">সেরা প্রতিমা</h4>` |
| Line 1033 | **ভোট** | `<span className="text-[10px] text-gray-500 block">ভোট (Votes)</span>` |
| Line 1044 | **সেরা ভাবনা** | `<h4 className="text-xs font-bold text-gray-900">সেরা ভাবনা</h4>` |
| Line 1052 | **ভোট** | `<span className="text-[10px] text-gray-500 block">ভোট (Votes)</span>` |
| Line 1063 | **সেরা আলোকসজ্জা** | `<h4 className="text-xs font-bold text-gray-900">সেরা আলোকসজ্জা</h4>` |
| Line 1071 | **ভোট** | `<span className="text-[10px] text-gray-500 block">ভোট (Votes)</span>` |
| Line 1082 | **পরিবেশবান্ধব** | `<h4 className="text-xs font-bold text-gray-900">পরিবেশবান্ধব</h4>` |
| Line 1090 | **ভোট** | `<span className="text-[10px] text-gray-500 block">ভোট (Votes)</span>` |
| Line 1103 | **সক্রিয় ভোট সুরক্ষা ও তদারকি** | `সক্রিয় ভোট সুরক্ষা ও তদারকি (Live Vote Audit)` |
| Line 1107 | **নিরাপদ ট্রানজ্যাকশন** | `নিরাপদ ট্রানজ্যাকশন (Secure Transactions)` |
| Line 1113 | **ভোটার পরিচয় যাচাই** | `<span>ভোটার পরিচয় যাচাই (Voter Verification):</span>` |
| Line 1114 | **ফায়ারবেস অথ ও ডিভাইস আইডি** | `<span className="font-semibold text-gray-800">ফায়ারবেস অথ ও ডিভাইস আইডি (Firebase Auth & Device ID)</span>` |
| Line 1117 | **দ্বৈত ভোট প্রতিরোধ** | `<span>দ্বৈত ভোট প্রতিরোধ (Anti-Duplicate):</span>` |
| Line 1118 | **১০০** <br> **সক্রিয়** | `<span className="font-semibold text-emerald-600">১০০% সক্রিয় (100% Active - One Vote per Pandal)</span>` |
| Line 1121 | **মণ্ডপ ভোটিং পেজ লিঙ্ক** | `<span>মণ্ডপ ভোটিং পেজ লিঙ্ক (Pandal Voting URL):</span>` |

---

### <a id="src-app-not-found-tsx"></a>5. `src/app/not-found.tsx`

- **Lines Containing Bengali:** 9

| Line | Extracted Bengali Text | Code Context |
| :--- | :--- | :--- |
| Line 24 | **হোমপেজ** | `<span className="text-xs sm:text-sm font-bold tracking-tight">হোমপেজ</span>` |
| Line 42 | **পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি** | `পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি` |
| Line 73 | **৪০৪ • মণ্ডপ খুঁজে পাওয়া যায়নি** | `<span>৪০৪ • মণ্ডপ খুঁজে পাওয়া যায়নি (404 - Not Found)</span>` |
| Line 79 | **৪০৪ - দুঃখিত! মণ্ডপ খুঁজে পাওয়া যায়নি** | `৪০৪ - দুঃখিত! মণ্ডপ খুঁজে পাওয়া যায়নি` |
| Line 85 | **অনুগ্রহ করে নিশ্চিত করুন যে আপনি সঠিক কিউআর কোড স্ক্যান করেছেন অথবা ঠিকানাটি সঠিক রয়েছে** | `অনুগ্রহ করে নিশ্চিত করুন যে আপনি সঠিক কিউআর কোড স্ক্যান করেছেন অথবা ঠিকানাটি সঠিক রয়েছে।` |
| Line 99 | **মূল পাতায় ফিরে যান** | `<span>মূল পাতায় ফিরে যান (Back to Homepage)</span>` |
| Line 107 | **কিউআর স্ক্যানার খুলুন** | `<span>কিউআর স্ক্যানার খুলুন (Scan QR)</span>` |
| Line 114 | **পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি • পশ্চিমবঙ্গ** | `<span>পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি • পশ্চিমবঙ্গ</span>` |
| Line 122 | **পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি** | `© {new Date().getFullYear()} পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি (Paschim Banga DurgaPuja Samannay Samity)` |

---

### <a id="src-app-organizer-auth-page-tsx"></a>6. `src/app/organizer/auth/page.tsx`

- **Lines Containing Bengali:** 17

| Line | Extracted Bengali Text | Code Context |
| :--- | :--- | :--- |
| Line 62 | **স্বাগতম সুপার অ্যাডমিন** | `toast.success('স্বাগতম সুপার অ্যাডমিন! (Welcome Super Admin!)', {` |
| Line 103 | **মূল পাতায় ফিরে যান** | `<span>মূল পাতায় ফিরে যান (Back to Feed)</span>` |
| Line 111 | **কমিটি নিবন্ধন** <br> **অর্গানাইজার লগইন** | `<span>{isFlipped ? 'কমিটি নিবন্ধন (Register)' : 'অর্গানাইজার লগইন (Login)'}</span>` |
| Line 147 | **অফিসিয়াল পিবিডিএস রেজিস্ট্রি** | `অফিসিয়াল পিবিডিএস রেজিস্ট্রি (Official PBDS Registry)` |
| Line 150 | **কমিটি নিবন্ধন** | `<span className="block text-xl sm:text-2xl font-sans font-bold text-gray-900 mb-0.5">কমিটি নিবন্ধন</span>` |
| Line 154 | **আপনার পূজা কমিটির কিউআর কোড তৈরি করতে** <br> **দিয়ে নিবন্ধন করুন** | `আপনার পূজা কমিটির কিউআর কোড তৈরি করতে Google দিয়ে নিবন্ধন করুন।` |
| Line 163 | **তাৎক্ষণিক গেট ভোটিং কিউআর কোড** | `<span>তাৎক্ষণিক গেট ভোটিং কিউআর কোড (Gate Voting QR)</span>` |
| Line 167 | **লাইভ ভোটিং ও অ্যানালিটিক্স ডেস্ক** | `<span>লাইভ ভোটিং ও অ্যানালিটিক্স ডেস্ক (Live Voting Desk)</span>` |
| Line 171 | **দুর্গাপুর পূজা সম্মাননা ২০২৬ এর মনোনয়ন** | `<span>দুর্গাপুর পূজা সম্মাননা ২০২৬ এর মনোনয়ন (Awards 2026)</span>` |
| Line 206 | **এর সাথে যুক্ত হচ্ছে** <br> **দিয়ে লগইন করুন** | `<span>{isLoading ? 'Google এর সাথে যুক্ত হচ্ছে... (Connecting...)' : 'Google দিয়ে লগইন করুন (Login with Google)'}</span>` |
| Line 217 | **ইতোমধ্যে নিবন্ধিত? এখানে লগইন করুন** | `<span>ইতোমধ্যে নিবন্ধিত? এখানে লগইন করুন (Already registered? Login here)</span>` |
| Line 250 | **পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি** | `পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি (Paschim Banga DurgaPuja Samannay Samity)` |
| Line 253 | **অর্গানাইজার লগইন** | `<span className="block text-xl sm:text-2xl font-sans font-bold text-gray-900 mb-0.5">অর্গানাইজার লগইন</span>` |
| Line 257 | **নিবন্ধিত পূজা কমিটির অনুমোদিত পোর্টাল। আপনার গেট কিউআর কোড ও লাইভ ভোটিং ডেস্ক পেতে লগইন করুন** | `নিবন্ধিত পূজা কমিটির অনুমোদিত পোর্টাল। আপনার গেট কিউআর কোড ও লাইভ ভোটিং ডেস্ক পেতে লগইন করুন।` |
| Line 265 | **শুধুমাত্র অনুমোদিত পূজা কমিটি সাইন ইন করতে পারবেন। নতুন কমিটি হলে অনুগ্রহ করে নিবন্ধন সম্পন্ন করুন** | `🔒 শুধুমাত্র অনুমোদিত পূজা কমিটি সাইন ইন করতে পারবেন। নতুন কমিটি হলে অনুগ্রহ করে নিবন্ধন সম্পন্ন করুন।` |
| Line 303 | **এর সাথে যুক্ত হচ্ছে** <br> **দিয়ে লগইন করুন** | `<span>{isLoading ? 'Google এর সাথে যুক্ত হচ্ছে... (Connecting...)' : 'Google দিয়ে লগইন করুন (Login with Google)'}</span>` |
| Line 315 | **নতুন কমিটি? এখানে নিবন্ধন করুন** | `<span>নতুন কমিটি? এখানে নিবন্ধন করুন (New committee? Register here)</span>` |

---

### <a id="src-app-organizer-callback-page-tsx"></a>7. `src/app/organizer/callback/page.tsx`

- **Lines Containing Bengali:** 1

| Line | Extracted Bengali Text | Code Context |
| :--- | :--- | :--- |
| Line 33 | **স্বাগতম সুপার অ্যাডমিন** | `toast.success('স্বাগতম সুপার অ্যাডমিন! (Welcome Super Admin!)', {` |

---

### <a id="src-app-organizer-setup-page-tsx"></a>8. `src/app/organizer/setup/page.tsx`

- **Lines Containing Bengali:** 2

| Line | Extracted Bengali Text | Code Context |
| :--- | :--- | :--- |
| Line 73 | **সুপার অ্যাডমিন অধিবেশন সক্রিয়** | `toast.success('সুপার অ্যাডমিন অধিবেশন সক্রিয় (Bypassing setup to Admin Panel...)', {` |
| Line 209 | **সুপার অ্যাডমিন অধিবেশন পুনর্নির্দেশ করা হচ্ছে** | `? 'সুপার অ্যাডমিন অধিবেশন পুনর্নির্দেশ করা হচ্ছে (Redirecting Super Admin...)'` |

---

### <a id="src-app-page-tsx"></a>9. `src/app/page.tsx`

- **Lines Containing Bengali:** 42

| Line | Extracted Bengali Text | Code Context |
| :--- | :--- | :--- |
| Line 182 | **পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি** | `পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি` |
| Line 188 | **শিল্পের সম্মান, ভক্তির উদযাপন** | `শিল্পের সম্মান, ভক্তির উদযাপন:<br />` |
| Line 190 | **আপনার মতামত গুরুত্বপূর্ণ** | `আপনার মতামত গুরুত্বপূর্ণ` |
| Line 200 | **বাংলার শ্রেষ্ঠ দুর্গাপূজা উদযাপন করুন আপনার প্রিয় পূজা প্যান্ডেলের শিল্পকলা এবং থিমকে সম্মান জানিয়ে** | `বাংলার শ্রেষ্ঠ দুর্গাপূজা উদযাপন করুন আপনার প্রিয় পূজা প্যান্ডেলের শিল্পকলা এবং থিমকে সম্মান জানিয়ে।` |
| Line 216 | **কিউআর স্ক্যানার খুলুন** | `<span className="font-bold">কিউআর স্ক্যানার খুলুন</span>` |
| Line 227 | **ভোটিং তালিকা** | `<span className="font-bold">ভোটিং তালিকা</span>` |
| Line 238 | **লাইভ র্যাঙ্কিং** | `<span className="font-bold">লাইভ র্যাঙ্কিং</span>` |
| Line 254 | **এক ডিভাইস • এক ভোট** | `<span className="font-bold">এক ডিভাইস • এক ভোট</span>` |
| Line 266 | **হার্ডওয়্যার-বাউন্ড ব্যালট** | `<span>হার্ডওয়্যার-বাউন্ড ব্যালট</span>` |
| Line 273 | **৪টি অ্যাওয়ার্ড টোকেন** | `<span>৪টি অ্যাওয়ার্ড টোকেন</span>` |
| Line 280 | **রিয়েল-টাইম সুরক্ষিত ট্যালি** | `<span>রিয়েল-টাইম সুরক্ষিত ট্যালি</span>` |
| Line 297 | **অফিসিয়াল ভোটিং তালিকা** | `<span>অফিসিয়াল ভোটিং তালিকা <span className="text-[10px] opacity-75 normal-case font-normal">(Official Voting List)</span></span>` |
| Line 300 | **অংশগ্রহণকারী** <br> **পূজা প্যান্ডেল** | `অংশগ্রহণকারী <span className="festive-gradient-text">পূজা প্যান্ডেল</span>` |
| Line 306 | **নিবন্ধিত পূজা কমিটিগুলি ব্রাউজ করুন। অন-সাইটে ভোট দিতে বা তাদের থিম দেখতে যেকোনো প্যান্ডেলে ট্যাপ করুন** | `নিবন্ধিত পূজা কমিটিগুলি ব্রাউজ করুন। অন-সাইটে ভোট দিতে বা তাদের থিম দেখতে যেকোনো প্যান্ডেলে ট্যাপ করুন।` |
| Line 320 | **প্যান্ডেল বা ওয়ার্ড অনুসন্ধান করুন** | `placeholder="প্যান্ডেল বা ওয়ার্ড অনুসন্ধান করুন... (Search pandal or ward...)"` |
| Line 338 | **সব ওয়ার্ড** | `সব ওয়ার্ড / All Wards ({pandals.length})` |
| Line 351 | **ওয়ার্ড** | `ওয়ার্ড (Ward) {w}` |
| Line 384 | **ওয়ার্ড** | `<span>ওয়ার্ড (Ward) {pandal.ward \|\| 'Durgapur'}</span>` |
| Line 404 | **থিম** | `<strong className="text-gray-900">থিম (Theme):</strong> {pandal.theme \|\| 'Traditional Durga Puja'}` |
| Line 410 | **মোট ভক্তদের ভোট** | `<span className="font-semibold text-gray-600">মোট ভক্তদের ভোট (Total Votes):</span>` |
| Line 424 | **প্যান্ডেল দেখুন** | `<span>প্যান্ডেল দেখুন</span>` |
| Line 437 | **এখনই ভোট দিন** | `<span>এখনই ভোট দিন</span>` |
| Line 452 | **এখনও কোনো মণ্ডপ নিবন্ধিত হয়নি** | `? 'এখনও কোনো মণ্ডপ নিবন্ধিত হয়নি'` |
| Line 453 | **কোনো মণ্ডপ খুঁজে পাওয়া যায়নি** | `: 'কোনো মণ্ডপ খুঁজে পাওয়া যায়নি'}` |
| Line 462 | **পূজা কমিটিগুলি বর্তমানে নিবন্ধনের প্রক্রিয়ায় রয়েছে। অনুমোদিত মণ্ডপগুলি এখানে সরাসরি প্রদর্শিত হবে** | `? 'পূজা কমিটিগুলি বর্তমানে নিবন্ধনের প্রক্রিয়ায় রয়েছে। অনুমোদিত মণ্ডপগুলি এখানে সরাসরি প্রদর্শিত হবে।'` |
| Line 463 | **অন্য কোনো নাম বা এলাকা দিয়ে অনুসন্ধান করুন অথবা সম্পূর্ণ তালিকা দেখতে সব ওয়ার্ড নির্বাচন করুন** | `: 'অন্য কোনো নাম বা এলাকা দিয়ে অনুসন্ধান করুন অথবা সম্পূর্ণ তালিকা দেখতে সব ওয়ার্ড নির্বাচন করুন।'}` |
| Line 479 | **ফিল্টার রিসেট করুন** | `ফিল্টার রিসেট করুন (Reset Filters)` |
| Line 495 | **নিরপেক্ষ মূল্যায়ন** | `<span>নিরপেক্ষ মূল্যায়ন <span className="text-[10px] opacity-75 normal-case font-normal">(Fair Play Guarantee)</span></span>` |
| Line 498 | **কিউআর কোড অন-সাইট ভোটিং পদ্ধতি** | `কিউআর কোড অন-সাইট ভোটিং পদ্ধতি` |
| Line 504 | **দুর্গাপূজা ২০২৬ উপলক্ষে প্রত্যেক ভক্তকে ৪টি বিশেষ ক্যাটাগরি টোকেন প্রদান করা হয়** | `দুর্গাপূজা ২০২৬ উপলক্ষে প্রত্যেক ভক্তকে ৪টি বিশেষ ক্যাটাগরি টোকেন প্রদান করা হয়।` |
| Line 517 | **সেরা প্রতিমা টোকেন** | `সেরা প্রতিমা টোকেন` |
| Line 521 | **অনবদ্য মৃৎশিল্প ও ঐতিহ্যবাহী প্রতিমা ভাস্কর্যের জন্য** | `অনবদ্য মৃৎশিল্প ও ঐতিহ্যবাহী প্রতিমা ভাস্কর্যের জন্য।` |
| Line 531 | **সেরা থিম টোকেন** | `সেরা থিম টোকেন` |
| Line 535 | **উদ্ভাবনী সামাজিক বার্তা ও মণ্ডপ সৃজন ধারণার জন্য** | `উদ্ভাবনী সামাজিক বার্তা ও মণ্ডপ সৃজন ধারণার জন্য।` |
| Line 545 | **সেরা আলোকসজ্জা টোকেন** | `সেরা আলোকসজ্জা টোকেন` |
| Line 549 | **চন্দননগর ঘরানার ডায়নামিক আলোকসজ্জা ও তোরণের জন্য** | `চন্দননগর ঘরানার ডায়নামিক আলোকসজ্জা ও তোরণের জন্য।` |
| Line 559 | **পরিবেশ-বান্ধব টোকেন** | `পরিবেশ-বান্ধব টোকেন` |
| Line 563 | **১০০** <br> **পরিবেশ-বান্ধব উপকরণ ও প্লাস্টিকমুক্ত পরিবেশের জন্য** | `১০০% পরিবেশ-বান্ধব উপকরণ ও প্লাস্টিকমুক্ত পরিবেশের জন্য।` |
| Line 579 | **পূজা কমিটি আয়োজকদের জন্য** | `<span>পূজা কমিটি আয়োজকদের জন্য <span className="text-[10px] opacity-75 font-normal">(For Puja Committee Organizers)</span></span>` |
| Line 582 | **আপনি কি পূজা কমিটির আয়োজক** | `আপনি কি পূজা কমিটির আয়োজক?` |
| Line 588 | **অফিসিয়াল কিউআর কোড স্ট্যান্ডি তৈরি করতে এবং লাইভ ভোটার অ্যানালিটিক্স দেখতে পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতির সাথে আপনার পূজা কমিটি নিবন্ধন করুন** | `অফিসিয়াল কিউআর কোড স্ট্যান্ডি তৈরি করতে এবং লাইভ ভোটার অ্যানালিটিক্স দেখতে পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতির সাথে আপনার পূজা কমিটি নিবন্ধন করুন।` |
| Line 601 | **আয়োজক লগইন / নিবন্ধন** | `<span>আয়োজক লগইন / নিবন্ধন</span>` |

---

### <a id="src-app-vote--committeeid--page-tsx"></a>10. `src/app/vote/[committeeId]/page.tsx`

- **Lines Containing Bengali:** 32

| Line | Extracted Bengali Text | Code Context |
| :--- | :--- | :--- |
| Line 32 | **দুর্গাপূজা মণ্ডপ** | `if (!slug) return 'দুর্গাপূজা মণ্ডপ (Durga Puja Pandal)';` |
| Line 55 | **সেরা প্রতিমা** | `bengali: 'সেরা প্রতিমা',` |
| Line 64 | **সেরা ভাবনা** | `bengali: 'সেরা ভাবনা',` |
| Line 73 | **সেরা আলোকসজ্জা** | `bengali: 'সেরা আলোকসজ্জা',` |
| Line 82 | **সেরা পরিবেশবান্ধব** | `bengali: 'সেরা পরিবেশবান্ধব',` |
| Line 219 | **আপনি ইতোমধ্যে এই পূজাকে ভোট প্রদান করেছেন** | `toast.error('আপনি ইতোমধ্যে এই পূজাকে ভোট প্রদান করেছেন! (You have already voted for this pandal)');` |
| Line 224 | **টোকেনটি ইতোমধ্যে ব্যবহৃত হয়েছে** | `toast.error('"${category.bengali} (${category.name})" টোকেনটি ইতোমধ্যে ব্যবহৃত হয়েছে! (Token already used)');` |
| Line 250 | **আপনার ভোট সফলভাবে গৃহীত হয়েছে! আপনি** <br> **কে** <br> **বিভাগে ভোট দিয়েছেন** | `toast.success('🎉 আপনার ভোট সফলভাবে গৃহীত হয়েছে! আপনি ${displayName}-কে "${category.bengali}" বিভাগে ভোট দিয়েছেন। (Vote Recorded Successfully!)', {` |
| Line 264 | **আপনি ইতোমধ্যে এই পূজাকে ভোট প্রদান করেছেন বা এই টোকেনটি ব্যবহার করেছেন** | `toast.error(data.message \|\| 'আপনি ইতোমধ্যে এই পূজাকে ভোট প্রদান করেছেন বা এই টোকেনটি ব্যবহার করেছেন। (Already voted or token used)');` |
| Line 271 | **ভোট জমা দিতে ব্যর্থ হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন** | `toast.error(data.message \|\| 'ভোট জমা দিতে ব্যর্থ হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন। (Unable to record vote)');` |
| Line 275 | **ইন্টারনেট সংযোগ সমস্যা। অনুগ্রহ করে পুনরায় চেষ্টা করুন** | `toast.error(err?.message \|\| 'ইন্টারনেট সংযোগ সমস্যা। অনুগ্রহ করে পুনরায় চেষ্টা করুন। (Network error)');` |
| Line 296 | **কিউআর স্ক্যানার** | `<span className="text-xs sm:text-sm font-bold tracking-tight">কিউআর স্ক্যানার</span>` |
| Line 314 | **পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি** | `পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি` |
| Line 335 | **অফিসিয়াল ডিজিটাল ব্যালট** | `<span>অফিসিয়াল ডিজিটাল ব্যালট (Official Ballot)</span>` |
| Line 339 | **মণ্ডপ খুঁজে পাওয়া যায়নি** | `{committeeNotFound ? 'মণ্ডপ খুঁজে পাওয়া যায়নি (Pandal Not Found)' : displayName}` |
| Line 354 | **ভাবনা** | `<span>ভাবনা: {committeeDetails.theme}</span>` |
| Line 364 | **মণ্ডপের বিবরণ যাচাই করা হচ্ছে** | `<p className="text-xs sm:text-sm font-bold text-gray-700">মণ্ডপের বিবরণ যাচাই করা হচ্ছে...</p>` |
| Line 380 | **এই মণ্ডপটি এখনও নিবন্ধিত হয়নি** | `এই মণ্ডপটি এখনও নিবন্ধিত হয়নি` |
| Line 386 | **পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতির অফিসিয়াল তালিকায় এই মণ্ডপটি এখনও তালিকাভুক্ত হয়নি বা অনুমোদন অপেক্ষমাণ রয়েছে** | `পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতির অফিসিয়াল তালিকায় এই মণ্ডপটি এখনও তালিকাভুক্ত হয়নি বা অনুমোদন অপেক্ষমাণ রয়েছে।` |
| Line 399 | **মূল পাতায় ফিরে যান** | `<span>মূল পাতায় ফিরে যান (Back to Homepage)</span>` |
| Line 405 | **অফিসিয়াল যাচাইকরণ সক্রিয় • অননুমোদিত ভোটিং প্রতিহত** | `<span>অফিসিয়াল যাচাইকরণ সক্রিয় • অননুমোদিত ভোটিং প্রতিহত</span>` |
| Line 421 | **ধন্যবাদ! আপনি ইতোমধ্যে এই কমিটিকে ভোট প্রদান করেছেন** | `ধন্যবাদ! আপনি ইতোমধ্যে এই কমিটিকে ভোট প্রদান করেছেন।` |
| Line 430 | **প্রদত্ত ভোট** | `<span>প্রদত্ত ভোট: {votedCategoryName}</span>` |
| Line 442 | **অন্যান্য মণ্ডপ স্ক্যান করুন** | `<span>অন্যান্য মণ্ডপ স্ক্যান করুন (Scan Other Pandals)</span>` |
| Line 448 | **ডিভাইস নিরাপত্তা যাচাইকৃত • ১ ডিভাইসে ১ ভোট নিয়ম কার্যকর** | `<span>ডিভাইস নিরাপত্তা যাচাইকৃত • ১ ডিভাইসে ১ ভোট নিয়ম কার্যকর</span>` |
| Line 455 | **এই পূজাকে সম্মানিত করতে নিচের ১টি বিভাগ বেছে নিন** | `এই পূজাকে সম্মানিত করতে নিচের ১টি বিভাগ বেছে নিন:` |
| Line 518 | **জমা হচ্ছে** | `<span>জমা হচ্ছে...</span>` |
| Line 523 | **ব্যবহৃত** | `ব্যবহৃত` |
| Line 529 | **ভোট দিন** | `<span>ভোট দিন</span>` |
| Line 546 | **নিরাপদ ভোট • ১ ডিভাইসে ১ ভোট** | `<span>নিরাপদ ভোট • ১ ডিভাইসে ১ ভোট (1 Vote Per Device)</span>` |
| Line 550 | **পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি • পশ্চিম বর্ধমান অঞ্চল** | `পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি • পশ্চিম বর্ধমান অঞ্চল` |
| Line 565 | **অন্য মণ্ডপ স্ক্যান করতে চান? কিউআর স্ক্যানারে ফিরে যান** | `<span>অন্য মণ্ডপ স্ক্যান করতে চান? কিউআর স্ক্যানারে ফিরে যান</span>` |

---

### <a id="src-components-layout-footer-tsx"></a>11. `src/components/layout/Footer.tsx`

- **Lines Containing Bengali:** 31

| Line | Extracted Bengali Text | Code Context |
| :--- | :--- | :--- |
| Line 38 | **২৪/৭ আঞ্চলিক জরুরি হেল্পলাইন** | `<span>২৪/৭ আঞ্চলিক জরুরি হেল্পলাইন:</span>` |
| Line 44 | **পুলিশ** | `<span>পুলিশ (Police):</span>` |
| Line 48 | **ফায়ার স্টেশন** | `<span>ফায়ার স্টেশন (Fire Station):</span>` |
| Line 52 | **অ্যাম্বুলেন্স** | `<span>অ্যাম্বুলেন্স (Ambulance):</span>` |
| Line 56 | **মহিলা হেল্পলাইন** | `<span>মহিলা হেল্পলাইন (Women Helpline):</span>` |
| Line 76 | **পশ্চিমবঙ্গ** <br> **দুর্গাপূজা** <br> **সমন্বয় সমিতি** | `পশ্চিমবঙ্গ <span className="text-sindoor-600">দুর্গাপূজা</span> সমন্বয় সমিতি` |
| Line 85 | **পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতির কেন্দ্রীয় ডিজিটাল ভোটিং, লাইভ লিডারবোর্ড ও অন্বেষণ প্ল্যাটফর্ম। শিল্পকলা, ঐতিহ্য এবং পরিবেশ-বান্ধব কারুশিল্পের সম্মাননা** | `পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতির কেন্দ্রীয় ডিজিটাল ভোটিং, লাইভ লিডারবোর্ড ও অন্বেষণ প্ল্যাটফর্ম। শিল্পকলা, ঐতিহ্য এবং পরিবেশ-বান্ধব কারুশিল্পের সম্মাননা।` |
| Line 94 | **নাগরিক স্বীকৃতি ও নিরাপত্তা সমন্বয়** | `<span className="font-bold">নাগরিক স্বীকৃতি ও নিরাপত্তা সমন্বয়</span>` |
| Line 105 | **দ্রুত নেভিগেশন** | `<span>দ্রুত নেভিগেশন</span>` |
| Line 116 | **মণ্ডপ দেখুন** | `<span className="font-bold text-gray-800">মণ্ডপ দেখুন</span>` |
| Line 127 | **লাইভ লিডারবোর্ড** | `<span className="font-bold text-gray-800">লাইভ লিডারবোর্ড</span>` |
| Line 140 | **আমার ভোট তালিকা** | `<span className="font-bold text-gray-800">আমার ভোট তালিকা</span>` |
| Line 151 | **প্যান্ডেল কিউআর কোড স্ক্যান** | `<span className="font-bold text-gray-800">প্যান্ডেল কিউআর কোড স্ক্যান</span>` |
| Line 163 | **আয়োজক পোর্টাল** | `<span className="font-bold text-gray-800">আয়োজক পোর্টাল</span>` |
| Line 177 | **আয়োজক ড্যাশবোর্ড ও কিউআর** | `<span className="font-bold text-gray-800">আয়োজক ড্যাশবোর্ড ও কিউআর</span>` |
| Line 191 | **অফিসিয়াল হেল্পডেস্ক** | `<span>অফিসিয়াল হেল্পডেস্ক</span>` |
| Line 197 | **ভোট সংক্রান্ত সমস্যা বা প্যান্ডেলের জন্য জরুরি সহায়তার প্রয়োজন? আমাদের কন্ট্রোল ডেস্কে যোগাযোগ করুন** | `ভোট সংক্রান্ত সমস্যা বা প্যান্ডেলের জন্য জরুরি সহায়তার প্রয়োজন? আমাদের কন্ট্রোল ডেস্কে যোগাযোগ করুন।` |
| Line 211 | **অভিযোগ টিকিট জমা দিন** | `<span>অভিযোগ টিকিট জমা দিন</span>` |
| Line 225 | **আয়োজক হোয়াটসঅ্যাপ ডেস্ক** | `<span>আয়োজক হোয়াটসঅ্যাপ ডেস্ক</span>` |
| Line 238 | **আইনি ও নাগরিক নিয়মাবলী** | `<span>আইনি ও নাগরিক নিয়মাবলী</span>` |
| Line 246 | **প্রতি বিভাগে একটি ভোট** | `<span className="font-bold text-gray-800">প্রতি বিভাগে একটি ভোট (Single Vote Per Category):</span>` |
| Line 247 | **প্রত্যেক যাচাইকৃত ভোটার প্রতি ক্যাটাগরিতে ১টি করে ভোট দিতে পারেন** | `<span className="block text-[11px] text-gray-600">প্রত্যেক যাচাইকৃত ভোটার প্রতি ক্যাটাগরিতে ১টি করে ভোট দিতে পারেন।</span>` |
| Line 253 | **প্লাস্টিকমুক্ত নির্দেশিকা** | `<span className="font-bold text-gray-800">প্লাস্টিকমুক্ত নির্দেশিকা (Zero-Plastic Mandate):</span>` |
| Line 254 | **মণ্ডপ প্রাঙ্গণে একক ব্যবহারের প্লাস্টিক কঠোরভাবে নিষিদ্ধ** | `<span className="block text-[11px] text-gray-600">মণ্ডপ প্রাঙ্গণে একক ব্যবহারের প্লাস্টিক কঠোরভাবে নিষিদ্ধ।</span>` |
| Line 260 | **অগ্নি নিরাপত্তা ছাড়পত্র** | `<span className="font-bold text-gray-800">অগ্নি নিরাপত্তা ছাড়পত্র (Fire Safety Clearance):</span>` |
| Line 261 | **জননিরাপত্তার স্বার্থে পৃথক প্রবেশ ও প্রস্থান পথ বাধ্যতামূলক** | `<span className="block text-[11px] text-gray-600">জননিরাপত্তার স্বার্থে পৃথক প্রবেশ ও প্রস্থান পথ বাধ্যতামূলক।</span>` |
| Line 273 | **২০২৬ পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি। সর্বস্বত্ব সংরক্ষিত** | `<span>© ২০২৬ পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি। সর্বস্বত্ব সংরক্ষিত।</span>` |
| Line 277 | **দুর্গাপূজার আন্তরিক প্রীতি ও শুভেচ্ছা** | `<span>দুর্গাপূজার আন্তরিক প্রীতি ও শুভেচ্ছা</span>` |
| Line 281 | **পশ্চিম বর্ধমান অঞ্চল** | `<span>পশ্চিম বর্ধমান অঞ্চল <span className="opacity-70">(Paschim Bardhaman)</span></span>` |
| Line 283 | **যাচাইকৃত** <br> **ইঞ্জিন** | `<span>যাচাইকৃত PWA ইঞ্জিন <span className="opacity-70">(Verified PWA)</span></span>` |
| Line 285 | **১০০** <br> **সুরক্ষিত** | `<span className="text-emerald-700 font-bold">১০০% সুরক্ষিত RBAC</span>` |

---

### <a id="src-components-layout-navbar-tsx"></a>12. `src/components/layout/Navbar.tsx`

- **Lines Containing Bengali:** 15

| Line | Extracted Bengali Text | Code Context |
| :--- | :--- | :--- |
| Line 86 | **পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি** | `পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি` |
| Line 112 | **মণ্ডপ দেখুন** | `<span>মণ্ডপ দেখুন</span>` |
| Line 129 | **লাইভ লিডারবোর্ড** | `<span>লাইভ লিডারবোর্ড</span>` |
| Line 147 | **আমার ভোট** | `<span>আমার ভোট</span>` |
| Line 170 | **ড্যাশবোর্ড** | `<span>ড্যাশবোর্ড</span>` |
| Line 185 | **সুপার অ্যাডমিন কন্ট্রোল প্যানেল** | `title="সুপার অ্যাডমিন কন্ট্রোল প্যানেল (Super Admin Panel)"` |
| Line 232 | **আয়োজক লগইন** | `<span>আয়োজক লগইন</span>` |
| Line 245 | **স্ক্যান ও ভোট** | `<span>স্ক্যান ও ভোট</span>` |
| Line 261 | **ড্যাশবোর্ড' : 'আয়োজক লগইন** | `<span>{isOrganizer ? 'ড্যাশবোর্ড' : 'আয়োজক লগইন'}</span>` |
| Line 297 | **আয়োজক ড্যাশবোর্ড' : 'আয়োজক লগইন** | `<span>{isOrganizer ? 'আয়োজক ড্যাশবোর্ড' : 'আয়োজক লগইন'}</span>` |
| Line 314 | **মণ্ডপ দেখুন** | `<span className="font-bold">মণ্ডপ দেখুন</span>` |
| Line 327 | **লাইভ লিডারবোর্ড** | `<span className="font-bold">লাইভ লিডারবোর্ড</span>` |
| Line 340 | **আমার ভোট** | `<span className="font-bold">আমার ভোট</span>` |
| Line 354 | **স্ক্যান ও ভোট** | `<span className="font-bold">স্ক্যান ও ভোট</span>` |
| Line 382 | **সুপার অ্যাডমিন কন্ট্রোল প্যানেল** | `<span className="text-[10px] text-amber-200">সুপার অ্যাডমিন কন্ট্রোল প্যানেল</span>` |

---

### <a id="src-components-organizer-organizerdashboard-tsx"></a>13. `src/components/organizer/OrganizerDashboard.tsx`

- **Lines Containing Bengali:** 4

| Line | Extracted Bengali Text | Code Context |
| :--- | :--- | :--- |
| Line 532 | **সুপার অ্যাডমিন কন্ট্রোল প্যানেল** | `title="সুপার অ্যাডমিন কন্ট্রোল প্যানেল (Super Admin Panel)"` |
| Line 1087 | **প্রতিমা** | `<option value="Idol">Idol (প্রতিমা)</option>` |
| Line 1088 | **ভাবনা** | `<option value="Theme">Theme (ভাবনা)</option>` |
| Line 1089 | **আলোকসজ্জা** | `<option value="Lighting">Lighting (আলোকসজ্জা)</option>` |

---

### <a id="src-components-voter-liveleaderboard-tsx"></a>14. `src/components/voter/LiveLeaderboard.tsx`

- **Lines Containing Bengali:** 2

| Line | Extracted Bengali Text | Code Context |
| :--- | :--- | :--- |
| Line 288 | **এখনও কোনো মণ্ডপ তালিকাভুক্ত হয়নি** | `এখনও কোনো মণ্ডপ তালিকাভুক্ত হয়নি` |
| Line 291 | **লাইভ লিডারবোর্ডে এখনও কোনো মণ্ডপ ভোট পায়নি। ভোট গ্রহণ শুরু হলে ফলাফল এখানে রিয়েল-টাইমে প্রকাশিত হবে** | `লাইভ লিডারবোর্ডে এখনও কোনো মণ্ডপ ভোট পায়নি। ভোট গ্রহণ শুরু হলে ফলাফল এখানে রিয়েল-টাইমে প্রকাশিত হবে।` |

---

### <a id="src-components-voter-myvotesview-tsx"></a>15. `src/components/voter/MyVotesView.tsx`

- **Lines Containing Bengali:** 5

| Line | Extracted Bengali Text | Code Context |
| :--- | :--- | :--- |
| Line 33 | **সেরা প্রতিমা** | `bengali: 'সেরা প্রতিমা',` |
| Line 40 | **সেরা ভাবনা** | `bengali: 'সেরা ভাবনা',` |
| Line 47 | **সেরা আলোকসজ্জা** | `bengali: 'সেরা আলোকসজ্জা',` |
| Line 54 | **সেরা পরিবেশ** | `bengali: 'সেরা পরিবেশ',` |
| Line 124 | **আমার ভোট ইতিহাস** | `<span>VOTER HALL OF DEVOTION • আমার ভোট ইতিহাস</span>` |

---

### <a id="src-data-mockpandals-ts"></a>16. `src/data/mockPandals.ts`

- **Lines Containing Bengali:** 4

| Line | Extracted Bengali Text | Code Context |
| :--- | :--- | :--- |
| Line 7 | **সেরা প্রতিমা** | `bengaliTitle: 'সেরা প্রতিমা (Pratima Shilpa)',` |
| Line 15 | **সেরা ভাবনা** | `bengaliTitle: 'সেরা ভাবনা (Mandap Srijan)',` |
| Line 23 | **সেরা আলোকসজ্জা** | `bengaliTitle: 'সেরা আলোকসজ্জা (Aalokshojja)',` |
| Line 31 | **সেরা পরিবেশবান্ধব** | `bengaliTitle: 'সেরা পরিবেশবান্ধব (Prakriti Bandhob)',` |

---

## Master List of All Unique Bengali Phrases

Below is a clean, numbered list of all unique Bengali phrases and text snippets extracted from across the codebase, ready for copy-pasting and linguistic verification:

1. ১০০
2. ১ম স্থান অধিকারী কমিটি
3. ২০২৬ পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি। সর্বস্বত্ব সংরক্ষিত
4. ২৪/৭ আঞ্চলিক জরুরি হেল্পলাইন
5. ৪০৪ - দুঃখিত! মণ্ডপ খুঁজে পাওয়া যায়নি
6. ৪০৪ • মণ্ডপ খুঁজে পাওয়া যায়নি
7. ৪টি অফিসিয়াল বিভাগ
8. ৪টি অ্যাওয়ার্ড টোকেন
9. অংশগ্রহণকারী
10. অগ্নি নিরাপত্তা ছাড়পত্র
11. অঞ্চল / ওয়ার্ড
12. অননুমোদিত প্রবেশাধিকার
13. অননুমোদিত প্রবেশাধিকার! শুধুমাত্র অনুমোদিত সুপার অ্যাডমিন কমিটি অনুমোদন করতে পারেন
14. অননুমোদিত প্রবেশাধিকার! শুধুমাত্র অনুমোদিত সুপার অ্যাডমিন কমিটি মুছে ফেলতে পারেন
15. অননুমোদিত প্রবেশাধিকার! শুধুমাত্র অনুমোদিত সুপার অ্যাডমিন টেস্ট ডেটা মুছতে পারেন
16. অননুমোদিত প্রবেশাধিকার! শুধুমাত্র অনুমোদিত সুপার অ্যাডমিন প্রবেশ করতে পারবেন
17. অনবদ্য মৃৎশিল্প ও ঐতিহ্যবাহী প্রতিমা ভাস্কর্যের জন্য
18. অনুগ্রহ করে নিশ্চিত করুন যে আপনি সঠিক কিউআর কোড স্ক্যান করেছেন অথবা ঠিকানাটি সঠিক রয়েছে
19. অনুমোদন করা হচ্ছে
20. অনুমোদন করুন
21. অনুমোদন হচ্ছে
22. অনুমোদিত
23. অনুমোদিত কমিটির জন্য অফিসিয়াল ভোটিং কিউআর কোড
24. অনুমোদিত সুপার অ্যাডমিন
25. অন্য অ্যাকাউন্ট দিয়ে লগইন করুন
26. অন্য কোনো নাম বা এলাকা দিয়ে অনুসন্ধান করুন অথবা সম্পূর্ণ তালিকা দেখতে সব ওয়ার্ড নির্বাচন করুন
27. অন্য মণ্ডপ স্ক্যান করতে চান? কিউআর স্ক্যানারে ফিরে যান
28. অন্যান্য মণ্ডপ স্ক্যান করুন
29. অপেক্ষমাণ
30. অফিসিয়াল কিউআর কোড স্ট্যান্ডি তৈরি করতে এবং লাইভ ভোটার অ্যানালিটিক্স দেখতে পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতির সাথে আপনার পূজা কমিটি নিবন্ধন করুন
31. অফিসিয়াল ডিজিটাল ব্যালট
32. অফিসিয়াল পিবিডিএস রেজিস্ট্রি
33. অফিসিয়াল ভোটিং তালিকা
34. অফিসিয়াল মণ্ডপ ভোটিং কিউআর
35. অফিসিয়াল যাচাইকরণ সক্রিয় • অননুমোদিত ভোটিং প্রতিহত
36. অফিসিয়াল হেল্পডেস্ক
37. অভিযোগ টিকিট জমা দিন
38. অর্গানাইজার লগইন
39. অ্যাকশন
40. অ্যাডমিন অনুমোদনের অপেক্ষায়
41. অ্যাডমিন লগআউট সম্পন্ন হয়েছে
42. অ্যাম্বুলেন্স
43. আইডি
44. আইনি ও নাগরিক নিয়মাবলী
45. আপনার অ্যাকাউন্টে কোনো নিবন্ধিত দুর্গাপূজা কমিটি পাওয়া যায়নি। অনুগ্রহ করে নিবন্ধন সম্পন্ন করুন
46. আপনার অ্যাকাউন্টের অধীনে কোনো অনুমোদিত দুর্গাপূজা কমিটি পাওয়া যায়নি। নিবন্ধন পেজে পুনর্নির্দেশ করা হচ্ছে
47. আপনার কাছে সমগ্র পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতির মাস্টার কন্ট্রোল অ্যাক্সেস রয়েছে। আপনি সরাসরি সুপার অ্যাডমিন প্যানেল পরিচালনা করতে পারেন
48. আপনার দুর্গাপূজা কমিটি সেন্ট্রাল সুপার অ্যাডমিন দ্বারা যাচাই ও অনুমোদনের অপেক্ষায় রয়েছে
49. আপনার দুর্গাপূজা কমিটির লাইভ ভোটিং ডেস্ক পরিচালনা করতে লগইন করুন। লগইন পেজে পুনর্নির্দেশ করা হচ্ছে
50. আপনার পূজা কমিটির কিউআর কোড তৈরি করতে
51. আপনার ভোট সফলভাবে গৃহীত হয়েছে! আপনি
52. আপনার মতামত গুরুত্বপূর্ণ
53. আপনার স্মার্টফোনের ক্যামেরা বা গুগল লেন্স খুলুন
54. আপনি ইতোমধ্যে এই পূজাকে ভোট প্রদান করেছেন
55. আপনি ইতোমধ্যে এই পূজাকে ভোট প্রদান করেছেন বা এই টোকেনটি ব্যবহার করেছেন
56. আপনি কি পূজা কমিটির আয়োজক
57. আমার ভোট
58. আমার ভোট ইতিহাস
59. আমার ভোট তালিকা
60. আয়োজক ডেস্ক
61. আয়োজক ড্যাশবোর্ড ও কিউআর
62. আয়োজক ড্যাশবোর্ড' : 'আয়োজক লগইন
63. আয়োজক ড্যাশবোর্ডে ফিরে যান
64. আয়োজক পোর্টাল
65. আয়োজক লগইন
66. আয়োজক লগইন / নিবন্ধন
67. আয়োজক লগইন করুন
68. আয়োজক লগইন প্রয়োজন
69. আয়োজক লাইভ ডেস্ক লোড হচ্ছে
70. আয়োজক সম্পাদক
71. আয়োজক হোয়াটসঅ্যাপ ডেস্ক
72. আয়োজকদের জন্য নির্দেশিকা
73. আলোকসজ্জা
74. ইংরেজি সংখ্যা
75. ইঞ্জিন
76. ইতোমধ্যে নিবন্ধিত? এখানে লগইন করুন
77. ইন্টারনেট সংযোগ সমস্যা। অনুগ্রহ করে পুনরায় চেষ্টা করুন
78. উদ্ভাবনী সামাজিক বার্তা ও মণ্ডপ সৃজন ধারণার জন্য
79. উপরের কিউআর কোডটি স্ক্যান করে অফিসিয়াল পেজে যান
80. এই পূজাকে সম্মানিত করতে নিচের ১টি বিভাগ বেছে নিন
81. এই মণ্ডপটি এখনও নিবন্ধিত হয়নি
82. এক ডিভাইস • এক ভোট
83. এক ডিভাইসে এক ভোট
84. একটি টেস্ট মণ্ডপ কমিটি নিবন্ধন করুন
85. এখনই ভোট দিন
86. এখনও কোনো মণ্ডপ তালিকাভুক্ত হয়নি
87. এখনও কোনো মণ্ডপ নিবন্ধিত হয়নি
88. এবং লাইভ ডেস্ক সংরক্ষিত রাখা হয়েছে। সুপার অ্যাডমিন দ্বারা অনুমোদিত হলে আপনি আপনার নিবন্ধিত নম্বরে একটি নিশ্চিতকরণ এসএমএস
89. এর সাথে যুক্ত হচ্ছে
90. ঐতিহ্যবাহী দুর্গাপূজা
91. ওয়ার্ড
92. কপি সম্পন্ন
93. কমিটি
94. কমিটি অনুমোদন করুন
95. কমিটি অনুমোদিত হয়েছে
96. কমিটি আইডি প্রদান করা আবশ্যক
97. কমিটি কোড
98. কমিটি ডেটা
99. কমিটি নিবন্ধন
100. কমিটি নিবন্ধন প্রয়োজন
101. কমিটি নিবন্ধন সম্পন্ন করুন
102. কমিটি মুছে ফেলতে ব্যর্থ হয়েছে
103. কমিটি মুছে ফেলার সময় ত্রুটি ঘটেছে
104. কমিটি, ফোন বা অঞ্চল খুঁজুন
105. কমিটির নাম
106. কিউআর কোড অন-সাইট ভোটিং পদ্ধতি
107. কিউআর স্ক্যানার
108. কিউআর স্ক্যানার খুলুন
109. কে
110. কোড ডাউনলোড করুন
111. কোড প্রসেস করতে সমস্যা হয়েছে
112. কোড লোড করা যায়নি
113. কোড সফলভাবে ডাউনলোড হয়েছে
114. কোড স্ক্যান করুন
115. কোনো কমিটি খুঁজে পাওয়া যায়নি
116. কোনো ফোন নম্বর নেই
117. কোনো মণ্ডপ খুঁজে পাওয়া যায়নি
118. গেট পোস্টার প্রিন্ট
119. গ্লোবাল ভোটিং ব্যবস্থা পরিচালনা
120. গ্লোবাল লিডারবোর্ড ও কমিটি অনুমোদন
121. চন্দননগর ঘরানার ডায়নামিক আলোকসজ্জা ও তোরণের জন্য
122. জননিরাপত্তার স্বার্থে পৃথক প্রবেশ ও প্রস্থান পথ বাধ্যতামূলক
123. জমা হচ্ছে
124. জরুরি পরিস্থিতিতে প্ল্যাটফর্মের ভোট গ্রহণ সক্রিয় বা স্থগিত রাখুন এবং অনুমোদিত কমিটির অডিট লগ ডাউনলোড করুন
125. টোকেনটি ইতোমধ্যে ব্যবহৃত হয়েছে
126. ডাউনলোড করার মতো কোনো কমিটি ডেটা নেই
127. ডাউনলোড ব্যর্থ হয়েছে
128. ডাউনলোড হচ্ছে
129. ডিভাইস নিরাপত্তা যাচাইকৃত • ১ ডিভাইসে ১ ভোট নিয়ম কার্যকর
130. ডিলিট
131. ডেটা মুছে ফেলার সময় সার্ভার ত্রুটি ঘটেছে
132. ডেস্ক
133. ড্যাশবোর্ড
134. ড্যাশবোর্ড' : 'আয়োজক লগইন
135. তথ্য সংগৃহীত হচ্ছে
136. তাৎক্ষণিক আপডেট
137. তাৎক্ষণিক গেট ভোটিং কিউআর কোড
138. থিম
139. দর্শনার্থীরা মণ্ডপে প্রবেশ করে এই কিউআর স্ক্যান করলেই সরাসরি ভোট প্রদান করতে পারবেন
140. দিয়ে নিবন্ধন করুন
141. দিয়ে লগইন করুন
142. দুর্গাপুর পূজা সম্মাননা ২০২৬ এর মনোনয়ন
143. দুর্গাপূজা
144. দুর্গাপূজা ২০২৬ উপলক্ষে প্রত্যেক ভক্তকে ৪টি বিশেষ ক্যাটাগরি টোকেন প্রদান করা হয়
145. দুর্গাপূজা ২০২৬ নিবন্ধিত মণ্ডপ
146. দুর্গাপূজা কমিটি
147. দুর্গাপূজা মণ্ডপ
148. দুর্গাপূজার আন্তরিক প্রীতি ও শুভেচ্ছা
149. দেখুন
150. দ্বৈত ভোট প্রতিরোধ
151. দ্রুত নেভিগেশন
152. ধন্যবাদ! আপনি ইতোমধ্যে এই কমিটিকে ভোট প্রদান করেছেন
153. নতুন কমিটি? এখানে নিবন্ধন করুন
154. নাগরিক স্বীকৃতি ও নিরাপত্তা সমন্বয়
155. নিবন্ধিত পূজা কমিটিগুলি ব্রাউজ করুন। অন-সাইটে ভোট দিতে বা তাদের থিম দেখতে যেকোনো প্যান্ডেলে ট্যাপ করুন
156. নিবন্ধিত পূজা কমিটির অনুমোদিত পোর্টাল। আপনার গেট কিউআর কোড ও লাইভ ভোটিং ডেস্ক পেতে লগইন করুন
157. নিরপেক্ষ মূল্যায়ন
158. নিরাপত্তা ও যাচাইকরণ নীতি
159. নিরাপত্তা নিশ্চিতকরণ ব্যর্থ হয়েছে
160. নিরাপদ ট্রানজ্যাকশন
161. নিরাপদ ভোট • ১ ডিভাইসে ১ ভোট
162. নেটওয়ার্ক ত্রুটি! কমিটি মুছে ফেলা যায়নি
163. পরিবেশ-বান্ধব উপকরণ ও প্লাস্টিকমুক্ত পরিবেশের জন্য
164. পরিবেশ-বান্ধব টোকেন
165. পরিবেশবান্ধব
166. পশ্চিম বর্ধমান
167. পশ্চিম বর্ধমান অঞ্চল
168. পশ্চিমবঙ্গ
169. পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি
170. পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি • দুর্গাপূজা ২০২৬
171. পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি • পশ্চিম বর্ধমান অঞ্চল
172. পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি • পশ্চিমবঙ্গ
173. পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতি • লাইভ অডিট কনসোল
174. পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতির অফিসিয়াল তালিকায় এই মণ্ডপটি এখনও তালিকাভুক্ত হয়নি বা অনুমোদন অপেক্ষমাণ রয়েছে
175. পশ্চিমবঙ্গ দুর্গাপূজা সমন্বয় সমিতির কেন্দ্রীয় ডিজিটাল ভোটিং, লাইভ লিডারবোর্ড ও অন্বেষণ প্ল্যাটফর্ম। শিল্পকলা, ঐতিহ্য এবং পরিবেশ-বান্ধব কারুশিল্পের সম্মাননা
176. পাবেন এবং এই পাতাটি স্বয়ংক্রিয়ভাবে লাইভ ডেস্কে রূপান্তরিত হবে
177. পুলিশ
178. পূজা কমিটি আয়োজকদের জন্য
179. পূজা কমিটিগুলি বর্তমানে নিবন্ধনের প্রক্রিয়ায় রয়েছে। অনুমোদিত মণ্ডপগুলি এখানে সরাসরি প্রদর্শিত হবে
180. পূজা প্যান্ডেল
181. পোস্টার প্রিন্ট
182. পোস্টারটি প্রিন্ট করে মণ্ডপের প্রধান তোরণ বা প্রবেশদ্বারে বড় করে প্রদর্শন করুন যাতে দর্শনার্থীরা সহজে ভোট দিতে পারেন
183. প্যান্ডেল কিউআর কোড স্ক্যান
184. প্যান্ডেল দেখুন
185. প্যান্ডেল বা ওয়ার্ড অনুসন্ধান করুন
186. প্রতি বিভাগে একটি ভোট
187. প্রতিটি ভোট ডিভাইসের নির্ভরযোগ্য ফায়ারস্টোর ট্রানজ্যাকশন দ্বারা সুরক্ষিত এবং দ্বৈত ভোট প্রতিরোধ ব্যবস্থার সাথে যুক্ত
188. প্রতিমা
189. প্রত্যেক যাচাইকৃত ভোটার প্রতি ক্যাটাগরিতে ১টি করে ভোট দিতে পারেন
190. প্রদত্ত ভোট
191. প্রদান করুন
192. প্রমাণীকরণ যাচাই করা হচ্ছে
193. প্লাস্টিকমুক্ত নির্দেশিকা
194. ফায়ার স্টেশন
195. ফায়ারবেস অথ ও ডিভাইস আইডি
196. ফায়ারস্টোর থেকে কমিটির লাইভ ডেটা আনা হচ্ছে
197. ফায়ারস্টোর থেকে লাইভ তালিকা লোড হচ্ছে
198. ফায়ারস্টোর লাইভ কাউন্টার
199. ফিল্টার রিসেট করুন
200. ফোন নেই
201. বাংলার শ্রেষ্ঠ দুর্গাপূজা উদযাপন করুন আপনার প্রিয় পূজা প্যান্ডেলের শিল্পকলা এবং থিমকে সম্মান জানিয়ে
202. বিভাগভিত্তিক লাইভ ফলাফল
203. বিভাগে ভোট দিয়েছেন
204. ব্যবহৃত
205. ব্যালট দেখুন
206. ভাবনা
207. ভোট
208. ভোট জমা দিতে ব্যর্থ হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন
209. ভোট দিতে
210. ভোট দিন
211. ভোট পুনরায় চালু করুন
212. ভোট সংক্রান্ত সমস্যা বা প্যান্ডেলের জন্য জরুরি সহায়তার প্রয়োজন? আমাদের কন্ট্রোল ডেস্কে যোগাযোগ করুন
213. ভোট সংখ্যা
214. ভোট সাময়িক স্থগিত করুন
215. ভোটার পরিচয় যাচাই
216. ভোটিং তালিকা
217. ভোটিং নিরাপত্তা
218. ভোটিং পেজ খুলুন
219. ভোটিং ব্যবস্থা সক্রিয় করা হয়েছে
220. ভোটিং সাময়িকভাবে স্থগিত রাখা হয়েছে
221. ভোটের লিংক কপি সম্পন্ন
222. ভোটের লিঙ্ক কপি করুন
223. ভোটের লিঙ্ক কপি হয়েছে
224. মণ্ডপ কিউআর কোড
225. মণ্ডপ খুঁজে পাওয়া যায়নি
226. মণ্ডপ দেখুন
227. মণ্ডপ প্রাঙ্গণে একক ব্যবহারের প্লাস্টিক কঠোরভাবে নিষিদ্ধ
228. মণ্ডপ ভোটিং পেজ লিঙ্ক
229. মণ্ডপের বিবরণ যাচাই করা হচ্ছে
230. মহিলা হেল্পলাইন
231. মাস্টার অ্যাডমিন কন্ট্রোল
232. মাস্টার অ্যাডমিন ড্যাশবোর্ড
233. মূল পাতায় ফিরে যান
234. মোট তালিকাভুক্ত মণ্ডপ
235. মোট নিবন্ধিত কমিটি
236. মোট প্রদত্ত ভোট
237. মোট ভক্তদের ভোট
238. মোট ভোট
239. যাচাইকরণ প্রক্রিয়াধীন
240. যাচাইকৃত
241. যাচাইকৃত আয়োজক
242. যাচাইকৃত দুর্গাপূজা মণ্ডপ
243. যোগাযোগ
244. রিয়েল-টাইম সুরক্ষিত ট্যালি
245. র‍্যাংক
246. লগআউট
247. লগআউট করুন
248. লগআউট ব্যর্থ হয়েছে
249. লগআউট সম্পন্ন হয়েছে
250. লগইন করা অ্যাকাউন্ট
251. লাইভ ফায়ারস্টোর সিঙ্ক
252. লাইভ ভোটিং ও অ্যানালিটিক্স ডেস্ক
253. লাইভ ভোটিং ডেস্ক
254. লাইভ র্যাঙ্কিং
255. লাইভ লিডারবোর্ড
256. লাইভ লিডারবোর্ডে এখনও কোনো মণ্ডপ ভোট পায়নি। ভোট গ্রহণ শুরু হলে ফলাফল এখানে রিয়েল-টাইমে প্রকাশিত হবে
257. লাইভ সিঙ্ক সক্রিয়
258. লিঙ্ক কপি করুন
259. শারদীয় ঐতিহ্যবাহী দুর্গাপূজা
260. শিল্পের সম্মান, ভক্তির উদযাপন
261. শীর্ষস্থানীয় মণ্ডপ
262. শুধুমাত্র অনুমোদিত পূজা কমিটি সাইন ইন করতে পারবেন। নতুন কমিটি হলে অনুগ্রহ করে নিবন্ধন সম্পন্ন করুন
263. সকল অঞ্চল
264. সকল স্থিতি
265. সক্রিয়
266. সক্রিয় ভোট সুরক্ষা ও তদারকি
267. সফলভাবে ডাউনলোড হয়েছে
268. সফলভাবে ডাটাবেস থেকে মুছে ফেলা হয়েছে
269. সব ওয়ার্ড
270. সমন্বয় সমিতি
271. সমস্ত টেস্ট/ডেমো ডেটা সফলভাবে ডাটাবেস থেকে মুছে ফেলা হয়েছে
272. সম্পাদনা
273. সর্বাধিক ভোটপ্রাপ্তির ক্রমানুসারে লাইভ তালিকা। এক ক্লিকে কমিটি অনুমোদন করুন এবং স্বয়ংক্রিয় এসএমএস পাঠান
274. সাধারণ অঞ্চল
275. সার্বজনীন পর্যবেক্ষণ ও অনুমোদন কেন্দ্র
276. সুপার অ্যাডমিন অধিবেশন
277. সুপার অ্যাডমিন অধিবেশন পুনর্নির্দেশ করা হচ্ছে
278. সুপার অ্যাডমিন অধিবেশন যাচাই করা হচ্ছে
279. সুপার অ্যাডমিন অধিবেশন সক্রিয়
280. সুপার অ্যাডমিন কন্ট্রোল প্যানেল
281. সুপার অ্যাডমিন কন্ট্রোল প্যানেল শুধুমাত্র অনুমোদিত সুপার অ্যাডমিন অ্যাকাউন্টের জন্য সংরক্ষিত। আপনাকে আয়োজক ড্যাশবোর্ডে পুনর্নির্দেশ করা হচ্ছে
282. সুরক্ষিত
283. সেরা আলোকসজ্জা
284. সেরা আলোকসজ্জা টোকেন
285. সেরা থিম টোকেন
286. সেরা পরিবেশ
287. সেরা পরিবেশবান্ধব
288. সেরা প্রতিমা
289. সেরা প্রতিমা টোকেন
290. সেরা প্রতিমা, সেরা ভাবনা, আলোকসজ্জা ও পরিবেশবান্ধব বিভাগে আপনার মূল্যবান ভোট দিন
291. সেরা ভাবনা
292. স্ক্যান ও ভোট
293. স্থায়ীভাবে মুছে ফেলা হচ্ছে
294. স্থায়ীভাবে মুছে ফেলা হয়েছে
295. স্থায়ীভাবে মুছে ফেলুন
296. স্থিতি
297. স্বাগতম সুপার অ্যাডমিন
298. হার্ডওয়্যার-বাউন্ড ব্যালট
299. হোমপেজ

