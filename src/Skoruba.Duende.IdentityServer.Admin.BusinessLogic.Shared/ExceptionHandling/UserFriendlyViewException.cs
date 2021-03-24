// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Shared.ExceptionHandling
{
    public class UserFriendlyViewException : Exception
    {
        public string ErrorKey { get; set; }

        public object Model { get; set; }
       
        public List<ViewErrorMessage> ErrorMessages { get; set; }

        public UserFriendlyViewException(string message, string errorKey, object model) : base(message)
        {
            ErrorKey = errorKey;
            Model = model;
        }

        public UserFriendlyViewException(string message, string errorKey, List<ViewErrorMessage> errorMessages, object model) : base(message)
        {
            ErrorKey = errorKey;
            Model = model;
            ErrorMessages = errorMessages;
        }

        public UserFriendlyViewException(string message, string errorKey, object model, Exception innerException) : base(message, innerException)
        {
            ErrorKey = errorKey;
            Model = model;
        }
    }
}