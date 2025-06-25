namespace SMSSender
{
    public interface ISMSSender
    {
        Task<String> SendSMSAsync(string number, string message);
    }

}
