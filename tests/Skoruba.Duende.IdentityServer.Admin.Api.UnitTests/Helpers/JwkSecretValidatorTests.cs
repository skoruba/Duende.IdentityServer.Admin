// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using FluentAssertions;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Dtos.ApiResources;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Dtos.Clients;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.Api.UnitTests.Helpers
{
    public class JwkSecretValidatorTests
    {
        private const string PublicRsaJwk = "{\"kty\":\"RSA\",\"n\":\"abc\",\"e\":\"AQAB\",\"alg\":\"PS256\",\"use\":\"sig\",\"kid\":\"1\"}";

        private static List<ValidationResult> Validate(object dto)
        {
            var results = new List<ValidationResult>();
            Validator.TryValidateObject(dto, new ValidationContext(dto), results, validateAllProperties: true);

            return results;
        }

        [Fact]
        public void PublicJwk_IsAccepted()
        {
            Validate(new ClientSecretApiDto { Type = "JWK", Value = PublicRsaJwk }).Should().BeEmpty();
        }

        [Theory]
        [InlineData("{\"kty\":\"RSA\",\"n\":\"abc\",\"e\":\"AQAB\",\"d\":\"private\"}", "'d'")]
        [InlineData("{\"kty\":\"EC\",\"crv\":\"P-256\",\"x\":\"a\",\"y\":\"b\",\"d\":\"private\"}", "'d'")]
        [InlineData("{\"keys\":[{\"kty\":\"RSA\",\"n\":\"abc\",\"e\":\"AQAB\",\"p\":\"private\"}]}", "'p'")]
        public void PrivateKeyMaterial_IsRejectedWhereverItSits(string value, string expectedMember)
        {
            var results = Validate(new ClientSecretApiDto { Type = "JWK", Value = value });

            results.Should().ContainSingle();
            results[0].ErrorMessage.Should().Contain(expectedMember);
            results[0].MemberNames.Should().Contain(nameof(ClientSecretApiDto.Value));
        }

        [Theory]
        [InlineData("{\"kty\":\"RSA\",\"n\":\"abc\",\"e\":\"AQAB\",\"D\":\"private\"}", "'D'")]
        [InlineData("{\"kty\":\"RSA\",\"n\":\"abc\",\"e\":\"AQAB\",\"Qi\":\"private\"}", "'Qi'")]
        [InlineData("{\"kty\":\"EC\",\"crv\":\"P-256\",\"x\":\"a\",\"y\":\"b\",\"K\":\"private\"}", "'K'")]
        public void PrivateKeyMaterial_IsRejectedRegardlessOfMemberCasing(string value, string expectedMember)
        {
            // JsonWebKey reads "D" as the private exponent, so the casing must not get it past the validator
            var results = Validate(new ClientSecretApiDto { Type = "JWK", Value = value });

            results.Should().ContainSingle();
            results[0].ErrorMessage.Should().Contain(expectedMember);
        }

        [Theory]
        [InlineData("jwk")]
        [InlineData("Jwk")]
        public void SecretTypeCasing_DoesNotSkipTheValidation(string secretType)
        {
            Validate(new ClientSecretApiDto { Type = secretType, Value = PublicRsaJwk }).Should().BeEmpty();
            Validate(new ClientSecretApiDto { Type = secretType, Value = "{\"kty\":\"RSA\",\"n\":\"abc\",\"e\":\"AQAB\",\"d\":\"private\"}" }).Should().ContainSingle();
            Validate(new ApiSecretApiDto { Type = secretType, Value = "not json" }).Should().ContainSingle();
        }

        [Fact]
        public void SymmetricKeyType_IsRejectedRegardlessOfCasing()
        {
            Validate(new ClientSecretApiDto { Type = "JWK", Value = "{\"kty\":\"OCT\"}" }).Should().ContainSingle();
        }

        [Fact]
        public void PublicJwkSet_IsRejected()
        {
            var results = Validate(new ClientSecretApiDto { Type = "JWK", Value = "{\"keys\":[" + PublicRsaJwk + "]}" });

            results.Should().ContainSingle();
            results[0].ErrorMessage.Should().Contain("JWK Set");
        }

        [Theory]
        [InlineData("{\"kty\":\"oct\"}")]
        [InlineData("{\"n\":\"abc\",\"e\":\"AQAB\"}")]
        [InlineData("{\"kty\":1,\"n\":\"abc\",\"e\":\"AQAB\"}")]
        [InlineData("{\"kty\":\"\"}")]
        [InlineData("{}")]
        [InlineData("not json")]
        [InlineData("[]")]
        public void UnusableJwk_IsRejected(string value)
        {
            Validate(new ClientSecretApiDto { Type = "JWK", Value = value }).Should().ContainSingle();
        }

        [Fact]
        public void OtherSecretTypes_AreNotParsed()
        {
            Validate(new ClientSecretApiDto { Type = "SharedSecret", Value = "{\"d\":\"just a secret that looks like JSON\"}" }).Should().BeEmpty();
        }

        [Fact]
        public void ApiResourceSecrets_FollowTheSameRule()
        {
            Validate(new ApiSecretApiDto { Type = "JWK", Value = PublicRsaJwk }).Should().BeEmpty();
            Validate(new ApiSecretApiDto { Type = "JWK", Value = "{\"kty\":\"RSA\",\"n\":\"abc\",\"e\":\"AQAB\",\"d\":\"private\"}" }).Should().ContainSingle();
        }
    }
}
