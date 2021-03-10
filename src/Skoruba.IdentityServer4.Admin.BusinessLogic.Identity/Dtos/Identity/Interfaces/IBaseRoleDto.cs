namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.Dtos.Identity.Interfaces
{
    public interface IBaseRoleDto
    {
        object Id { get; }
        bool IsDefaultId();
    }
}
