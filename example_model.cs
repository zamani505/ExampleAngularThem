 public class CustomerDetail
 {
     [Description("کد خطا")]
     public string AlertCode { get; set; }
     [Description("متن خطا")]
     public string MessageOut { get; set; }
     
     [Description(" شماره مشتری")]
     public string Cif { get; set; }
     [Description(" نام")]
     public string Firstname { get; set; }
     [Description(" نام خانوادگی")]
     public string Lastname { get; set; }
     [Description(" نام پدر")]
     public string FatherName { get; set; }
     [Description(" تاریخ افتتاح")]
     public string CreateDate { get; set; }
     [Description(" کد ملی یا کد اقتصادی")]
     public string EconomicCode { get; set; }
     [Description(" شماره شناسنامه")]
     public string IdentificationNumber { get; set; }
     [Description(" حساب ها")]
     public Account[] Accounts { get; set; }
 }
