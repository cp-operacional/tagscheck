--  insert into indeferidos_done
--  select cpf::int8 from (
(
    select
        distinct on (indef.cpf)
        LPAD(indef.cpf :: VARCHAR, 11, '0') as cpf,
        indef.nome_completo,
        -- extract(year from AGE(indef.data_nascimento))::int  as idade,
        -- indef.data_nascimento,
        -- indef.data_indeferimento,
        indef.especie_beneficio,
        indef.descricao_especie_beneficio,
        indef.motivo_indeferimento,
        -- indef.sexo,
        -- indef.nome_mae,
        indef.endereco,
        indef.bairro,
        indef.cep,
        indef.municipio,
        indef.uf,
        -- indef.competencia_indeferimento,
        -- indef.ano_indeferimento,
        -- indef.clientela,
        indef.celular_1,
        indef.resultado_celular_1,
        indef.celular_2,
        indef.resultado_celular_2,
        indef.celular_3,
        indef.resultado_celular_3,
        indef.celular_4,
        indef.resultado_celular_4,
        indef.fixo_1,
        indef.resultado_fixo_1,
        indef.fixo_2,
        indef.resultado_fixo_2,
        indef.fixo_3,
        indef.resultado_fixo_3,
        indef.fixo_4,
        indef.resultado_fixo_4,
        indef.email_1,
        indef.email_2,
        indef.email_3,
        indef.email_4,
        indef.resultado_geral_contato
    from
        pf_indeferidos indef
        left join indeferidos_done id on id.cpf :: int8 = indef.cpf
    where
        indef.competencia_indeferimento between 202407 and 202407
        and id.cpf is null
        -- and SE NOMENCLATURA ESTA CORRETA
        --    and indef.descricao_especie_beneficio ~ '^(APOSENTADORIA.*TEMPO|APOSENTADORIA.*IDADE)'  -- VERIFICAR SE NOMENCLATURA ESTA CORRETA
        --    or
        and indef.especie_beneficio not in (10, 13, 31, 35, 50, 91)
        -- )
        and (
            (
                indef.uf in ('PE')
                and indef.municipio in ('AGRESTINA', 'AGUAS BELAS', 'ARCOVERDE', 'BEZERROS', 'BOM CONSELHO', 'BREJO DA MADRE DE DEUS', 'BUIQUE', 'CAETES', 'CAMOCIM DE SAO FELIX', 'CAPOEIRAS', 'CARUARU', 'CORRENTES', 'CUMARU', 'GARANHUNS', 'ITAIBA', 'JUCATI', 'JUPI', 'LAJEDO', 'PALMEIRINA', 'PARANATAMA', 'PEDRA', 'SALOA', 'SANTA CRUZ DO CAPIBARIBE', 'SAO JOAO', 'TAQUARITINGA NORTE', 'TORITAMA', 'TUPANATINGA', 'VENTUROSA')
            )
        or (
                indef.uf in ('SE')
                and indef.municipio in ('CANINDE DE SAO FRANCISCO')
        )

        )
        -- and indef.celular_1 is not null
    limit
        885
)
union all
(
    select
        distinct on (indef.cpf)
        LPAD(indef.cpf :: VARCHAR, 11, '0') as cpf,
        indef.nome_completo,
        -- extract(year from AGE(indef.data_nascimento))::int  as idade,
        -- indef.data_nascimento,
        -- indef.data_indeferimento,
        indef.especie_beneficio,
        indef.descricao_especie_beneficio,
        indef.motivo_indeferimento,
        -- indef.sexo,
        -- indef.nome_mae,
        indef.endereco,
        indef.bairro,
        indef.cep,
        indef.municipio,
        indef.uf,
        -- indef.competencia_indeferimento,
        -- indef.ano_indeferimento,
        -- indef.clientela,
        indef.celular_1,
        indef.resultado_celular_1,
        indef.celular_2,
        indef.resultado_celular_2,
        indef.celular_3,
        indef.resultado_celular_3,
        indef.celular_4,
        indef.resultado_celular_4,
        indef.fixo_1,
        indef.resultado_fixo_1,
        indef.fixo_2,
        indef.resultado_fixo_2,
        indef.fixo_3,
        indef.resultado_fixo_3,
        indef.fixo_4,
        indef.resultado_fixo_4,
        -- indef.email_1,
        -- indef.email_2,
        -- indef.email_3,
        -- indef.email_4,
        indef.resultado_geral_contato
    from
        pf_indeferidos indef
        left join indeferidos_done id on id.cpf :: int8 = indef.cpf
    where
        indef.competencia_indeferimento between 202406 and 202406
        and id.cpf is null
        -- and SE NOMENCLATURA ESTA CORRETA
        --    and indef.descricao_especie_beneficio ~ '^(APOSENTADORIA.*TEMPO|APOSENTADORIA.*IDADE)'  -- VERIFICAR SE NOMENCLATURA ESTA CORRETA
        --    or
        and indef.especie_beneficio not in (10, 13, 31, 35, 50, 91)
        -- )
        and (
            (
                indef.uf in ('PE')
                and indef.municipio in ('AGRESTINA', 'AGUAS BELAS', 'ARCOVERDE', 'BEZERROS', 'BOM CONSELHO', 'BREJO DA MADRE DE DEUS', 'BUIQUE', 'CAETES', 'CAMOCIM DE SAO FELIX', 'CAPOEIRAS', 'CARUARU', 'CORRENTES', 'CUMARU', 'GARANHUNS', 'ITAIBA', 'JUCATI', 'JUPI', 'LAJEDO', 'PALMEIRINA', 'PARANATAMA', 'PEDRA', 'SALOA', 'SANTA CRUZ DO CAPIBARIBE', 'SAO JOAO', 'TAQUARITINGA NORTE', 'TORITAMA', 'TUPANATINGA', 'VENTUROSA')
            )
        or (
                indef.uf in ('SE')
                and indef.municipio in ('CANINDE DE SAO FRANCISCO')
        )

        )
        -- and indef.celular_1 is not null
    limit
        1000-885
)
-- ) as x

