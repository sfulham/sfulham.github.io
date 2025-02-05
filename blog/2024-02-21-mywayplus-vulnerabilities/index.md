---
slug: mywayplus-vulnerabilities
title: MyWay+ Vulnerabilities
authors: [sfulham]
tags: [myway+, actgov, nec]
---

# 

# Timeline

| Date            |                                                                                                    |
| --------------- | -------------------------------------------------------------------------------------------------- |
| 06-12-2024      | Initial report sent to ASD                                                                         |
| 12-12-2024      | Follow up email sent to ASD                                                                        |
| 12-12-2024      | Acknowledgement of report from ASD stating they have forwarded on the report                       |
| 12-12-2024      | Sent the report to ACT Government directly                                                         |
| 12 - 15-12-2024 | Most of the issues addressed in my report were patched                                             |
| 11-01-2025      | Sent a notice of intent to publicly disclose all patched vulnerabilities to ASD and ACT Government |
| 20-01-2025      | ACT Government acknowledged intent and asked to push back disclosure date                          |
| 21-02-2025      | Patched vulnerabilities publicly disclosed                                                         |

# Initial Discovery

As one of the user testers for MyWay+, I've officially had access to the MyWay+ portal since the 22nd of October 2024. Since then, myself, and a few other people in the community, have been poking around, seeing how the system works, trying to make sure it's up to standard. However, around about a week after the full launch of MyWay+ I recieved the following email (details have been removed for privacy reasons):

```
Note: Please do not reply to this auto-generated email.  
  
Dear (Account Name),  
Your MyWay+ account balance has been updated. Your top up autoload transaction has been completed successfully:  
  
Autoload Enabled: Yes  
Card number: 111111......1111  
Merchant: Canberra  
Top up amount: $x  e
MyWay+ transaction ref: (Reference Number)  
Payment transaction ref: (Reference Number)   
  
Thank you for travelling with Transport Canberra and using MyWay+.  
  
Transport Canberra and City Services  
Phone: 13 22 81  
Online: https://customers-dev.abtcustomer.com
```

Upon first glance, this appears to be a regular autoload notification email, however, as shown down the bottom there is a link to the development server[^1].
Upon first visiting the link, I was greeted with the MyWay+ portal, which I initially tried logging into with my regular MyWay+ credentials, which obviously didn't work.
While having access to this version of the portal would give me insight into upcoming features, redesigns, etc, I didn't end up creating a new account for it or anything like that. Instead, I did a look for subdomains under the https://abtcustomer.com domain name and really only found two (so far) interesting subdomains:
- https://sonar.abtcustomer.com; which just appears to have a self-hosted instance of the Sonar code testing server. This piqued my interest but I didn't really see any easy way in so I moved on quickly; and
- https://zipkins.abtcustomer.com/; a portal for all the tracing data in the development server[^1].

# The Tracing Portal

The tracing portal wasn't behind any sort of authentication; all of the data was freely available to see. After sending a few requests to the development server API[^1], I was able to quickly confirm that this was only the tracing data for the development server. I was quickly relieved to find this out, as it meant there wasn't going to be any PII[^2] of actual users in this data (foreshadowing...). After running a few queries, I quickly figured out that the MyWay+ API was split into several different services. Some of the key services include:
- abt-account-management;
- web-portal-business-service; and
- abt-web-business-service.

I do believe there are more, however, I didn't manage to record a full list.
Each trace in the portal usually included:
- The initial API request;
- a request to the authentication service if it was a protected route; and/or
- a query to the database;
However some also included additional API requests to other services if needed.

In the case of queries to the database, the trace also included the parameterised database query. In the case of a user creation, the query was:
```sql
insert into "public"."user_portal" ("user_id", "user_name", "title", "first_name", "middle_name", "last_name", "role_id", "password", "dob", "gender", "user_email", "user_contact", "user_addr_line1", "user_addr_line2", "user_addr_line3", "user_city", "user_state", "user_country", "user_postal", "occupation", "is_active", "mobile_verified", "email_verified", "is_sys_gen_pwd", "is_deleted", "created_by", "created_date", "updated_by", "updated_date", "pgm_id", "version", "salt_value", "company_id", "parent_user_id", "relationship", "country_code", "user_classification") values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
```
# The API Routes

After searching through as many unique traces as a could, I found a few key unauthenticated API routes and their responses:
- `/abt-account-management/abt/account/faremedia/fare-media-list?accountNo={accNo}`
	- Account details:
		- Name; and
		- Phone number.
	- MyWay+ Card details:
		- Full Myway+ Card number;
		- CVV; and
		- Whether or not the card was suspended.
	- Credit/debit Card details:
		- First six and last four numbers of the card[^3];
		- Card expiry.
- `/abt-account-management/abt/account/faremedia/user-card-name-list?accountno={accNo}&accountType=2&mediaStatus=00001,00002`
	- Summarised version of above
- `/abt-account-management/abt/account/faremedia/balance-transfer-list?userId={userId}`
	- List of all the balance transfers from the original MyWay system, including the amount transferred, for the requested user.
- `/abt-account-management/abt/account/balancefaremedia/get-parent-account-balance?parentAccNo={accNo}`
	- Current balance of requested user
- `/abt-account-management/abt/account/manage-post-paid-payments/saved-card?accountNo=705`
	- Cards saved for autoload/transactions made through the portal (not the linked cards for tapping on)
		- First six and last four numbers of the card[^3];
		- Card expiry.
- `/web-portal-business-service/abt/wpbs/c-portal/user-detail-by-userId/{userId}`
	- Entire user database entry, including:
		- Name;
		- Username;
		- Hashed/Encrypted Password (haven't figured out how they're hashing/encrypting the password yet);
		- Password Salt;
		- Address (if saved);
		- Email address;
		- Phone number;
		- Parent account number; and
		- RoleID.

All of the above routes were unprotected, and didn't require any form of authentication. They were also all initiated under the hood by other API routes, usually initially from the MyWay+ Portal.

The userId is saved in the browser's local storage, and so a simple piece of targeted malware could easily get the userId. There is also a route[^4] that returns the account number from the userId. Both the userId and account number are sequential, which could mean someone could've iterated over all possible numbers, and get all the data from the MyWay+ user database. This is strongly discouraged by even other government agencies such as the Commonwealth Fraud Prevention Centre[^5].

# Disclosure to NEC

On the 6th of December 2024, I reached out to ASD (Australian Signals Directorate) via their website to disclose all vulnerabilities I had found, including some minor problems that have not been fixed, but are not currently exploitable. These minor problems I have not brought up in the hopes that NEC will fix them.
On the 12th of December, I recieved a response from ASD acknowledging my report, and that they had forwarded on the report to involved parties. 
By the 15th of December, all vulnerabilities disclosed in this report were fixed.

[^1]: Portal: https://customers-dev.abtcustomer.com; API: https://dapi.abtcustomer.com/
[^2]: Personally Identifiable Information
[^3]: The first six digits of a card is what's known as the Bank Identification Number; these numbers can identify which bank the card belongs to, as well as whether the card is a debit, or a credit card. These digits are the absolute maximum a merchant can display (given authorised access) under the industry regulation PCI DSS. The BIN, when linked to an email address or phone number, can be used for targeted phishing attacks. The most NEC should store is the last 4 digits, to help customers identify the card, or better yet, fetch this data directly from the payment provider, without NEC directly storing the card details, specifically from Windcove (for autoload and portal transactions) and Littlepay (for cards used for tapping on to transit services)
[^4]: `/web-portal-business-service/abt/wpbs/c-portal/get-account-no-by-user-id/{userId}`
[^5]: https://www.counterfraud.gov.au/fraud-countermeasures/unique-identifiers