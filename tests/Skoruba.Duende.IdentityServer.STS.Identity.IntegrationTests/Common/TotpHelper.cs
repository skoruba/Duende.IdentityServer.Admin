// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Buffers.Binary;
using System.Security.Cryptography;

namespace Skoruba.Duende.IdentityServer.STS.Identity.IntegrationTests.Common
{
    /// <summary>
    /// The code an authenticator app shows for an ASP.NET Core Identity authenticator key - RFC 6238
    /// with the parameters Identity validates against: HMAC-SHA1, 30 second steps, 6 digits.
    /// </summary>
    public static class TotpHelper
    {
        private const string Base32Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        private const int TimeStepSeconds = 30;

        public static string ComputeCode(string base32Key)
        {
            var counter = new byte[8];
            BinaryPrimitives.WriteInt64BigEndian(counter, DateTimeOffset.UtcNow.ToUnixTimeSeconds() / TimeStepSeconds);

            var hash = HMACSHA1.HashData(FromBase32(base32Key), counter);

            var offset = hash[^1] & 0x0F;
            var binaryCode = ((hash[offset] & 0x7F) << 24)
                             | (hash[offset + 1] << 16)
                             | (hash[offset + 2] << 8)
                             | hash[offset + 3];

            return (binaryCode % 1_000_000).ToString("D6");
        }

        private static byte[] FromBase32(string input)
        {
            var encoded = input.TrimEnd('=').ToUpperInvariant();
            var output = new byte[encoded.Length * 5 / 8];

            var buffer = 0;
            var bitsInBuffer = 0;
            var index = 0;

            foreach (var character in encoded)
            {
                var value = Base32Alphabet.IndexOf(character);
                if (value < 0)
                {
                    throw new FormatException($"'{character}' is not a Base32 character.");
                }

                buffer = (buffer << 5) | value;
                bitsInBuffer += 5;

                if (bitsInBuffer >= 8)
                {
                    bitsInBuffer -= 8;
                    output[index++] = (byte)(buffer >> bitsInBuffer);
                    buffer &= (1 << bitsInBuffer) - 1;
                }
            }

            return output;
        }
    }
}
